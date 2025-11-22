import {
    collection,
    getDocs,
    query,
    where,
    Timestamp,
} from 'firebase/firestore';
import { db } from './index';
import { timelineService } from './timeline';

export interface AnalyticsMetrics {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    resolutionRate: number;
    avgResolutionTimeHours: number;
    activeCustomers: number;
    firstResponseTimeHours: number;
    slaCompliance: number;
}

export interface TicketTrend {
    period: string; // "2025-W10" or "2025-03"
    created: number;
    resolved: number;
}

export interface CategoryDistribution {
    category: string;
    count: number;
    percentage: number;
}

export const analyticsService = {
    /**
     * Calculate comprehensive analytics metrics
     */
    async getMetrics(): Promise<AnalyticsMetrics> {
        try {
            const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
            const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const totalTickets = tickets.length;
            const resolvedTickets = tickets.filter((t: any) => t.status === 'resolved').length;
            const openTickets = tickets.filter((t: any) => t.status !== 'resolved').length;
            const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;

            // Calculate average resolution time
            const avgResolutionTimeHours = await this.calculateAvgResolutionTime();

            // Calculate first response time
            const firstResponseTimeHours = await this.calculateFirstResponseTime();

            // Calculate SLA compliance
            const slaCompliance = await this.calculateSLACompliance();

            // Count active customers (customers with at least one ticket)
            const uniqueCustomerIds = new Set(tickets.map((t: any) => t.companyId).filter(Boolean));
            const activeCustomers = uniqueCustomerIds.size;

            return {
                totalTickets,
                openTickets,
                resolvedTickets,
                resolutionRate: Math.round(resolutionRate * 10) / 10, // Round to 1 decimal
                avgResolutionTimeHours: Math.round(avgResolutionTimeHours * 10) / 10,
                activeCustomers,
                firstResponseTimeHours: Math.round(firstResponseTimeHours * 10) / 10,
                slaCompliance: Math.round(slaCompliance * 10) / 10,
            };
        } catch (error) {
            console.error('Error calculating metrics:', error);
            throw error;
        }
    },

    /**
     * Calculate average resolution time in hours
     */
    async calculateAvgResolutionTime(): Promise<number> {
        try {
            const q = query(collection(db, 'tickets'), where('status', '==', 'resolved'));
            const snapshot = await getDocs(q);
            const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (tickets.length === 0) return 0;

            let totalResolutionTime = 0;
            let validTickets = 0;

            for (const ticket of tickets) {
                const createdAt = (ticket as any).createdAt;
                const updatedAt = (ticket as any).updatedAt;

                if (createdAt && updatedAt) {
                    const createdTime = createdAt.toMillis ? createdAt.toMillis() : new Date(createdAt).getTime();
                    const resolvedTime = updatedAt.toMillis ? updatedAt.toMillis() : new Date(updatedAt).getTime();
                    
                    const resolutionTimeMs = resolvedTime - createdTime;
                    totalResolutionTime += resolutionTimeMs;
                    validTickets++;
                }
            }

            if (validTickets === 0) return 0;

            const avgResolutionTimeMs = totalResolutionTime / validTickets;
            return avgResolutionTimeMs / (1000 * 60 * 60); // Convert to hours
        } catch (error) {
            console.error('Error calculating avg resolution time:', error);
            return 0;
        }
    },

    /**
     * Calculate average first response time in hours
     * First response is the time from ticket creation to first status change
     */
    async calculateFirstResponseTime(): Promise<number> {
        try {
            const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
            const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (tickets.length === 0) return 0;

            let totalResponseTime = 0;
            let validTickets = 0;

            for (const ticket of tickets) {
                try {
                    const timeline = await timelineService.getByTicketId((ticket as any).id);
                    
                    // Find the first status change or assignment after creation
                    const createdEntry = timeline.find(entry => entry.type === 'created');
                    const firstResponseEntry = timeline.find(entry => 
                        entry.type === 'status_changed' || entry.type === 'assigned'
                    );

                    if (createdEntry && firstResponseEntry && createdEntry.createdAt && firstResponseEntry.createdAt) {
                        const createdTime = createdEntry.createdAt.toMillis ? 
                            createdEntry.createdAt.toMillis() : 
                            new Date(createdEntry.createdAt).getTime();
                        
                        const responseTime = firstResponseEntry.createdAt.toMillis ? 
                            firstResponseEntry.createdAt.toMillis() : 
                            new Date(firstResponseEntry.createdAt).getTime();

                        const responseTimeMs = responseTime - createdTime;
                        if (responseTimeMs > 0) {
                            totalResponseTime += responseTimeMs;
                            validTickets++;
                        }
                    }
                } catch (error) {
                    // Skip tickets with timeline errors
                    continue;
                }
            }

            if (validTickets === 0) return 0;

            const avgResponseTimeMs = totalResponseTime / validTickets;
            return avgResponseTimeMs / (1000 * 60 * 60); // Convert to hours
        } catch (error) {
            console.error('Error calculating first response time:', error);
            return 0;
        }
    },

    /**
     * Calculate SLA compliance percentage
     * Tickets resolved within their SLA deadline are compliant
     */
    async calculateSLACompliance(): Promise<number> {
        try {
            const q = query(collection(db, 'tickets'), where('status', '==', 'resolved'));
            const snapshot = await getDocs(q);
            const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (tickets.length === 0) return 0;

            let compliantTickets = 0;
            let validTickets = 0;

            for (const ticket of tickets) {
                const slaDeadline = (ticket as any).slaDeadline;
                const updatedAt = (ticket as any).updatedAt;

                if (slaDeadline && updatedAt) {
                    const deadlineTime = new Date(slaDeadline).getTime();
                    const resolvedTime = updatedAt.toMillis ? updatedAt.toMillis() : new Date(updatedAt).getTime();

                    if (resolvedTime <= deadlineTime) {
                        compliantTickets++;
                    }
                    validTickets++;
                }
            }

            if (validTickets === 0) return 0;

            return (compliantTickets / validTickets) * 100;
        } catch (error) {
            console.error('Error calculating SLA compliance:', error);
            return 0;
        }
    },

    /**
     * Get ticket trends grouped by week or month
     */
    async getTicketTrends(period: 'week' | 'month', count: number): Promise<TicketTrend[]> {
        try {
            const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
            const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Group tickets by period
            const trendsMap = new Map<string, { created: number; resolved: number }>();

            for (const ticket of tickets) {
                const createdAt = (ticket as any).createdAt;
                if (!createdAt) continue;

                const createdDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
                const periodKey = this.getPeriodKey(createdDate, period);

                if (!trendsMap.has(periodKey)) {
                    trendsMap.set(periodKey, { created: 0, resolved: 0 });
                }

                const trend = trendsMap.get(periodKey)!;
                trend.created++;

                if ((ticket as any).status === 'resolved') {
                    trend.resolved++;
                }
            }

            // Convert to array and sort by period
            const trends: TicketTrend[] = Array.from(trendsMap.entries())
                .map(([period, data]) => ({
                    period,
                    created: data.created,
                    resolved: data.resolved,
                }))
                .sort((a, b) => a.period.localeCompare(b.period));

            // Return only the most recent 'count' periods
            return trends.slice(-count);
        } catch (error) {
            console.error('Error getting ticket trends:', error);
            return [];
        }
    },

    /**
     * Get category distribution with counts and percentages
     */
    async getCategoryDistribution(): Promise<CategoryDistribution[]> {
        try {
            const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
            const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const totalTickets = tickets.length;
            if (totalTickets === 0) return [];

            // Count tickets by category
            const categoryMap = new Map<string, number>();

            for (const ticket of tickets) {
                const category = (ticket as any).category || 'uncategorized';
                categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
            }

            // Convert to array with percentages
            const distribution: CategoryDistribution[] = Array.from(categoryMap.entries())
                .map(([category, count]) => ({
                    category: this.formatCategoryName(category),
                    count,
                    percentage: Math.round((count / totalTickets) * 100 * 10) / 10,
                }))
                .sort((a, b) => b.count - a.count); // Sort by count descending

            return distribution;
        } catch (error) {
            console.error('Error getting category distribution:', error);
            return [];
        }
    },

    /**
     * Helper: Get period key for grouping (week or month)
     */
    getPeriodKey(date: Date, period: 'week' | 'month'): string {
        const year = date.getFullYear();
        
        if (period === 'month') {
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return `${year}-${month}`;
        } else {
            // Calculate week number
            const firstDayOfYear = new Date(year, 0, 1);
            const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
            const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            return `${year}-W${String(weekNumber).padStart(2, '0')}`;
        }
    },

    /**
     * Helper: Format category name for display
     */
    formatCategoryName(category: string): string {
        const categoryNames: Record<string, string> = {
            telephony: 'Telephony',
            copiers: 'Copiers',
            cctv: 'CCTV',
            internet: 'Internet',
            office: 'Office Automation',
            uncategorized: 'Uncategorized',
        };

        return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
    },
};
