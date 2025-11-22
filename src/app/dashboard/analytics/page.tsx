"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BarChart3,
    Users,
    Ticket,
    Clock,
    CheckCircle2,
} from "lucide-react";
import { analyticsService, AnalyticsMetrics, TicketTrend, CategoryDistribution } from "@/lib/firebase/analytics";

export default function AnalyticsPage() {
    const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
    const [trends, setTrends] = useState<TicketTrend[]>([]);
    const [categories, setCategories] = useState<CategoryDistribution[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [metricsData, trendsData, categoriesData] = await Promise.all([
                    analyticsService.getMetrics(),
                    analyticsService.getTicketTrends('month', 6),
                    analyticsService.getCategoryDistribution(),
                ]);
                setMetrics(metricsData);
                setTrends(trendsData);
                setCategories(categoriesData);
            } catch (error) {
                console.error("Error loading analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Format resolution time for display
    const formatResolutionTime = (hours: number): string => {
        if (hours < 24) {
            return `${hours.toFixed(1)} hrs`;
        } else {
            const days = (hours / 24).toFixed(1);
            return `${days} days`;
        }
    };

    const stats = metrics ? [
        {
            name: "Total Tickets",
            value: metrics.totalTickets.toString(),
            icon: Ticket,
            gradient: "from-blue-500 to-indigo-600",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-600",
        },
        {
            name: "Resolution Rate",
            value: `${metrics.resolutionRate.toFixed(1)}%`,
            icon: CheckCircle2,
            gradient: "from-emerald-500 to-teal-600",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-600",
        },
        {
            name: "Avg Resolution Time",
            value: formatResolutionTime(metrics.avgResolutionTimeHours),
            icon: Clock,
            gradient: "from-amber-500 to-orange-600",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-600",
        },
        {
            name: "Active Customers",
            value: metrics.activeCustomers.toString(),
            icon: Users,
            gradient: "from-purple-500 to-pink-600",
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-600",
        },
    ] : [];

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-4 sm:p-6 lg:p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Analytics</h1>
                    </div>
                    <p className="text-purple-100 mt-2 text-sm sm:text-base">
                        Track performance metrics and insights
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="relative overflow-hidden border-0 shadow-lg">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`}></div>
                        <CardContent className="relative p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                        {stat.name}
                                    </p>
                                    <h3 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold">{stat.value}</h3>
                                </div>
                                <div className={`rounded-2xl p-3 sm:p-4 ${stat.iconBg}`}>
                                    <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Ticket Trends Chart */}
                <Card className="shadow-lg border-0">
                    <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            Ticket Trends (Last 6 Months)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        {trends.length > 0 ? (
                            <div className="space-y-4">
                                {/* Chart */}
                                <div className="flex items-end justify-between gap-2 h-48">
                                    {trends.map((trend, index) => {
                                        const maxValue = Math.max(...trends.map(t => Math.max(t.created, t.resolved)));
                                        const createdHeight = maxValue > 0 ? (trend.created / maxValue) * 100 : 0;
                                        const resolvedHeight = maxValue > 0 ? (trend.resolved / maxValue) * 100 : 0;
                                        
                                        return (
                                            <div key={trend.period} className="flex-1 flex flex-col items-center gap-1">
                                                <div className="w-full flex gap-1 items-end h-40">
                                                    {/* Created bar */}
                                                    <div 
                                                        className="flex-1 bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t transition-all hover:opacity-80 relative group"
                                                        style={{ height: `${createdHeight}%` }}
                                                        title={`Created: ${trend.created}`}
                                                    >
                                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {trend.created}
                                                        </span>
                                                    </div>
                                                    {/* Resolved bar */}
                                                    <div 
                                                        className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-600 rounded-t transition-all hover:opacity-80 relative group"
                                                        style={{ height: `${resolvedHeight}%` }}
                                                        title={`Resolved: ${trend.resolved}`}
                                                    >
                                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {trend.resolved}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-muted-foreground mt-1">
                                                    {trend.period.replace(/(\d{4})-(\d{2})/, '$2/$1').replace(/(\d{4})-W(\d{2})/, 'W$2')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Legend */}
                                <div className="flex items-center justify-center gap-6 pt-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-indigo-600"></div>
                                        <span className="text-sm text-muted-foreground">Created</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-500 to-teal-600"></div>
                                        <span className="text-sm text-muted-foreground">Resolved</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
                                <p className="text-muted-foreground">No trend data available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Category Distribution Chart */}
                <Card className="shadow-lg border-0">
                    <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                            Category Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        {categories.length > 0 ? (
                            <div className="space-y-4">
                                {categories.map((category, index) => {
                                    const colors = [
                                        'from-blue-500 to-indigo-600',
                                        'from-emerald-500 to-teal-600',
                                        'from-amber-500 to-orange-600',
                                        'from-purple-500 to-pink-600',
                                        'from-red-500 to-rose-600',
                                        'from-cyan-500 to-blue-600',
                                    ];
                                    const gradient = colors[index % colors.length];
                                    
                                    return (
                                        <div key={category.category} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{category.category}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground">{category.count} tickets</span>
                                                    <span className="font-semibold">{category.percentage}%</span>
                                                </div>
                                            </div>
                                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                                                    style={{ width: `${category.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
                                <p className="text-muted-foreground">No category data available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Performance Metrics */}
            {metrics && (
                <Card className="shadow-lg border-0">
                    <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                            Performance Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                                <p className="text-sm text-muted-foreground">First Response Time</p>
                                <p className="text-2xl font-bold mt-2">
                                    {formatResolutionTime(metrics.firstResponseTimeHours)}
                                </p>
                                <Badge 
                                    variant={metrics.firstResponseTimeHours <= 2 ? "default" : "outline"} 
                                    className="mt-2"
                                >
                                    {metrics.firstResponseTimeHours <= 2 ? "Excellent" : "Target: 2 hrs"}
                                </Badge>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                                <p className="text-sm text-muted-foreground">Open Tickets</p>
                                <p className="text-2xl font-bold mt-2">{metrics.openTickets}</p>
                                <Badge variant="outline" className="mt-2">
                                    {metrics.openTickets === 0 ? "All Clear" : "Active"}
                                </Badge>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                                <p className="text-sm text-muted-foreground">SLA Compliance</p>
                                <p className="text-2xl font-bold mt-2">{metrics.slaCompliance.toFixed(1)}%</p>
                                <Badge 
                                    variant={metrics.slaCompliance >= 90 ? "default" : metrics.slaCompliance >= 75 ? "outline" : "destructive"}
                                    className="mt-2"
                                >
                                    {metrics.slaCompliance >= 90 ? "Excellent" : metrics.slaCompliance >= 75 ? "Good" : "Needs Improvement"}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
