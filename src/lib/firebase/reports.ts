import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    limit,
} from 'firebase/firestore';
import { db } from './index';
import { formatCurrency } from '../utils/currency';

/**
 * Report metadata interface
 */
export interface Report {
    id: string;
    name: string;
    type: 'tickets' | 'customers' | 'performance' | 'financial';
    description: string;
    lastGenerated?: string;
}

/**
 * Report data structure returned by generation functions
 */
export interface ReportData {
    title: string;
    generatedAt: string;
    data: any;
    summary: Record<string, any>;
}

/**
 * Report download history entry
 */
interface ReportDownload {
    reportId: string;
    reportName: string;
    userId: string;
    downloadedAt: Timestamp;
    parameters?: Record<string, any>;
}

export const reportsService = {
    /**
     * Generate Monthly Ticket Summary Report
     * Aggregates ticket data by month showing created, resolved, and breakdown by category
     */
    async generateMonthlyTicketSummary(year: number, month: number): Promise<ReportData> {
        try {
            const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
            const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Filter tickets for the specified month
            const monthTickets = tickets.filter((ticket: any) => {
                if (!ticket.createdAt) return false;
                
                const createdDate = ticket.createdAt.toDate ? 
                    ticket.createdAt.toDate() : 
                    new Date(ticket.createdAt);
                
                return createdDate.getFullYear() === year && 
                       createdDate.getMonth() === month - 1;
            });

            const resolvedTickets = monthTickets.filter((t: any) => t.status === 'resolved');
            
            // Breakdown by category
            const categoryBreakdown: Record<string, number> = {};
            monthTickets.forEach((ticket: any) => {
                const category = ticket.category || 'uncategorized';
                categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
            });

            // Breakdown by priority
            const priorityBreakdown: Record<string, number> = {};
            monthTickets.forEach((ticket: any) => {
                const priority = ticket.priority || 'medium';
                priorityBreakdown[priority] = (priorityBreakdown[priority] || 0) + 1;
            });

            // Calculate average resolution time for resolved tickets
            let totalResolutionTime = 0;
            let validResolutionCount = 0;

            resolvedTickets.forEach((ticket: any) => {
                if (ticket.createdAt && ticket.updatedAt) {
                    const createdTime = ticket.createdAt.toMillis ? 
                        ticket.createdAt.toMillis() : 
                        new Date(ticket.createdAt).getTime();
                    const resolvedTime = ticket.updatedAt.toMillis ? 
                        ticket.updatedAt.toMillis() : 
                        new Date(ticket.updatedAt).getTime();
                    
                    totalResolutionTime += (resolvedTime - createdTime);
                    validResolutionCount++;
                }
            });

            const avgResolutionTimeHours = validResolutionCount > 0 
                ? totalResolutionTime / validResolutionCount / (1000 * 60 * 60)
                : 0;

            const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' });

            return {
                title: `Monthly Ticket Summary - ${monthName} ${year}`,
                generatedAt: new Date().toISOString(),
                data: {
                    tickets: monthTickets,
                    categoryBreakdown,
                    priorityBreakdown,
                },
                summary: {
                    totalCreated: monthTickets.length,
                    totalResolved: resolvedTickets.length,
                    resolutionRate: monthTickets.length > 0 
                        ? Math.round((resolvedTickets.length / monthTickets.length) * 100 * 10) / 10 
                        : 0,
                    avgResolutionTimeHours: Math.round(avgResolutionTimeHours * 10) / 10,
                    categoryBreakdown,
                    priorityBreakdown,
                },
            };
        } catch (error) {
            console.error('Error generating monthly ticket summary:', error);
            throw error;
        }
    },

    /**
     * Generate Customer Activity Report
     * Shows ticket counts and resolution times per customer
     */
    async generateCustomerActivityReport(customerId?: string): Promise<ReportData> {
        try {
            const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
            const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const customersSnapshot = await getDocs(collection(db, 'customers'));
            const customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Filter by specific customer if provided
            const filteredTickets = customerId 
                ? tickets.filter((t: any) => t.companyId === customerId)
                : tickets;

            // Group tickets by customer
            const customerActivity: Record<string, any> = {};

            filteredTickets.forEach((ticket: any) => {
                const companyId = ticket.companyId || 'unknown';
                
                if (!customerActivity[companyId]) {
                    const customer = customers.find((c: any) => c.id === companyId);
                    customerActivity[companyId] = {
                        customerId: companyId,
                        customerName: customer ? (customer as any).name : 'Unknown',
                        totalTickets: 0,
                        openTickets: 0,
                        resolvedTickets: 0,
                        totalResolutionTime: 0,
                        resolvedCount: 0,
                    };
                }

                const activity = customerActivity[companyId];
                activity.totalTickets++;

                if (ticket.status === 'resolved') {
                    activity.resolvedTickets++;
                    
                    // Calculate resolution time
                    if (ticket.createdAt && ticket.updatedAt) {
                        const createdTime = ticket.createdAt.toMillis ? 
                            ticket.createdAt.toMillis() : 
                            new Date(ticket.createdAt).getTime();
                        const resolvedTime = ticket.updatedAt.toMillis ? 
                            ticket.updatedAt.toMillis() : 
                            new Date(ticket.updatedAt).getTime();
                        
                        activity.totalResolutionTime += (resolvedTime - createdTime);
                        activity.resolvedCount++;
                    }
                } else {
                    activity.openTickets++;
                }
            });

            // Calculate average resolution time for each customer
            const customerData = Object.values(customerActivity).map((activity: any) => ({
                ...activity,
                avgResolutionTimeHours: activity.resolvedCount > 0
                    ? Math.round((activity.totalResolutionTime / activity.resolvedCount / (1000 * 60 * 60)) * 10) / 10
                    : 0,
            }));

            // Sort by total tickets descending
            customerData.sort((a, b) => b.totalTickets - a.totalTickets);

            return {
                title: customerId 
                    ? `Customer Activity Report - ${customerData[0]?.customerName || 'Unknown'}`
                    : 'Customer Activity Report - All Customers',
                generatedAt: new Date().toISOString(),
                data: {
                    customers: customerData,
                },
                summary: {
                    totalCustomers: customerData.length,
                    totalTickets: filteredTickets.length,
                    avgTicketsPerCustomer: customerData.length > 0
                        ? Math.round((filteredTickets.length / customerData.length) * 10) / 10
                        : 0,
                },
            };
        } catch (error) {
            console.error('Error generating customer activity report:', error);
            throw error;
        }
    },

    /**
     * Generate SLA Performance Report
     * Calculates compliance rates and breach incidents
     */
    async generateSLAPerformanceReport(): Promise<ReportData> {
        try {
            const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
            const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const resolvedTickets = tickets.filter((t: any) => t.status === 'resolved');

            let compliantTickets = 0;
            let breachedTickets = 0;
            const breachDetails: any[] = [];
            
            // Breakdown by priority
            const priorityBreakdown: Record<string, { total: number; compliant: number; breached: number }> = {
                low: { total: 0, compliant: 0, breached: 0 },
                medium: { total: 0, compliant: 0, breached: 0 },
                high: { total: 0, compliant: 0, breached: 0 },
                urgent: { total: 0, compliant: 0, breached: 0 },
            };

            let totalResolutionTime = 0;
            let totalSLATime = 0;
            let validTickets = 0;

            resolvedTickets.forEach((ticket: any) => {
                const priority = ticket.priority || 'medium';
                const slaDeadline = ticket.slaDeadline;
                const updatedAt = ticket.updatedAt;

                if (slaDeadline && updatedAt) {
                    const deadlineTime = new Date(slaDeadline).getTime();
                    const resolvedTime = updatedAt.toMillis ? 
                        updatedAt.toMillis() : 
                        new Date(updatedAt).getTime();
                    const createdTime = ticket.createdAt?.toMillis ? 
                        ticket.createdAt.toMillis() : 
                        new Date(ticket.createdAt).getTime();

                    priorityBreakdown[priority].total++;
                    validTickets++;

                    const resolutionTime = resolvedTime - createdTime;
                    const slaTime = deadlineTime - createdTime;
                    
                    totalResolutionTime += resolutionTime;
                    totalSLATime += slaTime;

                    if (resolvedTime <= deadlineTime) {
                        compliantTickets++;
                        priorityBreakdown[priority].compliant++;
                    } else {
                        breachedTickets++;
                        priorityBreakdown[priority].breached++;
                        
                        breachDetails.push({
                            ticketId: ticket.id,
                            title: ticket.title,
                            priority,
                            slaDeadline: new Date(slaDeadline).toISOString(),
                            resolvedAt: new Date(resolvedTime).toISOString(),
                            breachTimeHours: Math.round((resolvedTime - deadlineTime) / (1000 * 60 * 60) * 10) / 10,
                        });
                    }
                }
            });

            const complianceRate = validTickets > 0 
                ? Math.round((compliantTickets / validTickets) * 100 * 10) / 10 
                : 0;

            const avgResolutionTimeHours = validTickets > 0
                ? Math.round((totalResolutionTime / validTickets / (1000 * 60 * 60)) * 10) / 10
                : 0;

            const avgSLATimeHours = validTickets > 0
                ? Math.round((totalSLATime / validTickets / (1000 * 60 * 60)) * 10) / 10
                : 0;

            return {
                title: 'SLA Performance Report',
                generatedAt: new Date().toISOString(),
                data: {
                    breachDetails,
                    priorityBreakdown,
                },
                summary: {
                    totalTickets: validTickets,
                    compliantTickets,
                    breachedTickets,
                    complianceRate,
                    avgResolutionTimeHours,
                    avgSLATimeHours,
                    priorityBreakdown,
                },
            };
        } catch (error) {
            console.error('Error generating SLA performance report:', error);
            throw error;
        }
    },

    /**
     * Generate Revenue Analysis Report
     * Aggregates billing data in Rand for the specified date range
     */
    async generateRevenueAnalysis(startDate: string, endDate: string): Promise<ReportData> {
        try {
            const invoicesSnapshot = await getDocs(collection(db, 'invoices'));
            const invoices = invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const customersSnapshot = await getDocs(collection(db, 'customers'));
            const customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const start = new Date(startDate);
            const end = new Date(endDate);

            // Filter invoices within date range
            const periodInvoices = invoices.filter((invoice: any) => {
                if (!invoice.issueDate) return false;
                const issueDate = new Date(invoice.issueDate);
                return issueDate >= start && issueDate <= end;
            });

            let totalRevenue = 0;
            let paidRevenue = 0;
            let pendingRevenue = 0;
            let overdueRevenue = 0;

            const revenueByCustomer: Record<string, { name: string; total: number; paid: number; pending: number }> = {};

            periodInvoices.forEach((invoice: any) => {
                const amount = typeof invoice.amount === 'number' 
                    ? invoice.amount 
                    : parseFloat(invoice.amount) || 0;

                totalRevenue += amount;

                if (invoice.status === 'paid') {
                    paidRevenue += amount;
                } else if (invoice.status === 'pending') {
                    pendingRevenue += amount;
                } else if (invoice.status === 'overdue') {
                    overdueRevenue += amount;
                }

                // Group by customer
                const customerId = invoice.customerId || 'unknown';
                if (!revenueByCustomer[customerId]) {
                    const customer = customers.find((c: any) => c.id === customerId);
                    revenueByCustomer[customerId] = {
                        name: customer ? (customer as any).name : 'Unknown',
                        total: 0,
                        paid: 0,
                        pending: 0,
                    };
                }

                revenueByCustomer[customerId].total += amount;
                if (invoice.status === 'paid') {
                    revenueByCustomer[customerId].paid += amount;
                } else {
                    revenueByCustomer[customerId].pending += amount;
                }
            });

            // Convert to array and sort by total revenue
            const customerRevenue = Object.entries(revenueByCustomer)
                .map(([customerId, data]) => ({
                    customerId,
                    ...data,
                }))
                .sort((a, b) => b.total - a.total);

            // Calculate payment trends (monthly breakdown)
            const monthlyTrends: Record<string, { revenue: number; invoices: number }> = {};
            
            periodInvoices.forEach((invoice: any) => {
                if (!invoice.issueDate) return;
                
                const issueDate = new Date(invoice.issueDate);
                const monthKey = `${issueDate.getFullYear()}-${String(issueDate.getMonth() + 1).padStart(2, '0')}`;
                
                if (!monthlyTrends[monthKey]) {
                    monthlyTrends[monthKey] = { revenue: 0, invoices: 0 };
                }

                const amount = typeof invoice.amount === 'number' 
                    ? invoice.amount 
                    : parseFloat(invoice.amount) || 0;

                if (invoice.status === 'paid') {
                    monthlyTrends[monthKey].revenue += amount;
                }
                monthlyTrends[monthKey].invoices++;
            });

            return {
                title: `Revenue Analysis Report - ${startDate} to ${endDate}`,
                generatedAt: new Date().toISOString(),
                data: {
                    invoices: periodInvoices,
                    customerRevenue,
                    monthlyTrends,
                },
                summary: {
                    totalRevenue: formatCurrency(totalRevenue),
                    paidRevenue: formatCurrency(paidRevenue),
                    pendingRevenue: formatCurrency(pendingRevenue),
                    overdueRevenue: formatCurrency(overdueRevenue),
                    totalInvoices: periodInvoices.length,
                    paidInvoices: periodInvoices.filter((i: any) => i.status === 'paid').length,
                    pendingInvoices: periodInvoices.filter((i: any) => i.status === 'pending').length,
                    avgInvoiceValue: formatCurrency(periodInvoices.length > 0 ? totalRevenue / periodInvoices.length : 0),
                    customerRevenue,
                },
            };
        } catch (error) {
            console.error('Error generating revenue analysis:', error);
            throw error;
        }
    },

    /**
     * Save report download to history
     * Tracks when users download reports for audit purposes
     */
    async saveReportDownload(
        reportId: string,
        reportName: string,
        userId: string,
        parameters?: Record<string, any>
    ): Promise<void> {
        try {
            await addDoc(collection(db, 'reportDownloads'), {
                reportId,
                reportName,
                userId,
                parameters: parameters || {},
                downloadedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error saving report download:', error);
            throw error;
        }
    },

    /**
     * Get recent report downloads for a user
     * Returns the most recent downloads with limit
     */
    async getRecentDownloads(userId: string, limitCount: number = 10): Promise<any[]> {
        try {
            const q = query(
                collection(db, 'reportDownloads'),
                where('userId', '==', userId),
                orderBy('downloadedAt', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error('Error getting recent downloads:', error);
            return [];
        }
    },

    /**
     * Export report to PDF using browser print API
     * This function triggers the browser's print dialog for PDF generation
     */
    exportToPDF(): void {
        // Trigger browser print dialog
        // The ReportPrintTemplate component handles the print-specific styling
        window.print();
    },

    /**
     * Get all available report types
     */
    getAvailableReports(): Report[] {
        return [
            {
                id: 'monthly-ticket-summary',
                name: 'Monthly Ticket Summary',
                type: 'tickets',
                description: 'Comprehensive overview of ticket activity for a specific month',
            },
            {
                id: 'customer-activity',
                name: 'Customer Activity Report',
                type: 'customers',
                description: 'Ticket counts and resolution times per customer',
            },
            {
                id: 'sla-performance',
                name: 'SLA Performance Report',
                type: 'performance',
                description: 'SLA compliance rates and breach analysis',
            },
            {
                id: 'revenue-analysis',
                name: 'Revenue Analysis',
                type: 'financial',
                description: 'Billing data and revenue trends in Rand',
            },
        ];
    },
};
