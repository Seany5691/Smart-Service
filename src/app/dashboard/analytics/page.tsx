"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Ticket,
    Clock,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { ticketService, customerService } from "@/lib/firebase/services";

export default function AnalyticsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [ticketsData, customersData] = await Promise.all([
                    ticketService.getAll(),
                    customerService.getAll(),
                ]);
                setTickets(ticketsData);
                setCustomers(customersData);
            } catch (error) {
                console.error("Error loading analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === "open" || t.status === "in-progress").length;
    const resolvedTickets = tickets.filter(t => t.status === "resolved").length;
    const avgResolutionTime = "2.5 days"; // Placeholder

    const stats = [
        {
            name: "Total Tickets",
            value: totalTickets.toString(),
            change: "+12%",
            trend: "up",
            icon: Ticket,
            gradient: "from-blue-500 to-indigo-600",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-600",
        },
        {
            name: "Resolution Rate",
            value: totalTickets > 0 ? `${Math.round((resolvedTickets / totalTickets) * 100)}%` : "0%",
            change: "+8%",
            trend: "up",
            icon: CheckCircle2,
            gradient: "from-emerald-500 to-teal-600",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-600",
        },
        {
            name: "Avg Resolution Time",
            value: avgResolutionTime,
            change: "-15%",
            trend: "down",
            icon: Clock,
            gradient: "from-amber-500 to-orange-600",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-600",
        },
        {
            name: "Active Customers",
            value: customers.length.toString(),
            change: "+5%",
            trend: "up",
            icon: Users,
            gradient: "from-purple-500 to-pink-600",
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-600",
        },
    ];

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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <h1 className="text-4xl font-bold">Analytics</h1>
                    </div>
                    <p className="text-purple-100 mt-2">
                        Track performance metrics and insights
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="relative overflow-hidden border-0 shadow-lg">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`}></div>
                        <CardContent className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.name}
                                    </p>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <h3 className="text-4xl font-bold">{stat.value}</h3>
                                        <span className={`flex items-center text-sm font-medium ${
                                            stat.trend === "up" ? "text-green-600" : "text-red-600"
                                        }`}>
                                            {stat.trend === "up" ? (
                                                <TrendingUp className="mr-1 h-3 w-3" />
                                            ) : (
                                                <TrendingDown className="mr-1 h-3 w-3" />
                                            )}
                                            {stat.change}
                                        </span>
                                    </div>
                                </div>
                                <div className={`rounded-2xl p-4 ${stat.iconBg}`}>
                                    <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="shadow-lg border-0">
                    <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <CardTitle>Ticket Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="p-12 text-center">
                        <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
                        <p className="text-muted-foreground">Chart visualization coming soon</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                    <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                        <CardTitle>Category Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="p-12 text-center">
                        <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
                        <p className="text-muted-foreground">Chart visualization coming soon</p>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Metrics */}
            <Card className="shadow-lg border-0">
                <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                    <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                            <p className="text-sm text-muted-foreground">First Response Time</p>
                            <p className="text-2xl font-bold mt-2">1.2 hrs</p>
                            <Badge variant="outline" className="mt-2">Target: 2 hrs</Badge>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                            <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                            <p className="text-2xl font-bold mt-2">4.8/5</p>
                            <Badge variant="outline" className="mt-2">Excellent</Badge>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                            <p className="text-sm text-muted-foreground">SLA Compliance</p>
                            <p className="text-2xl font-bold mt-2">94%</p>
                            <Badge variant="outline" className="mt-2">On Track</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
