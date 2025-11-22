"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Ticket,
    Clock,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Plus,
    ArrowRight,
    Users,
    Building2,
} from "lucide-react";
import Link from "next/link";
import { ticketService, customerService } from "@/lib/firebase/services";
import { format, formatDistanceToNow } from "date-fns";
import EnhancedTicketModal from "@/components/modals/EnhancedTicketModal";

export default function DashboardPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTicketModal, setShowNewTicketModal] = useState(false);

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
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();

        // Subscribe to real-time updates
        const unsubscribe = ticketService.subscribeToTickets((data) => {
            setTickets(data);
        });

        return () => unsubscribe();
    }, []);

    const openTickets = tickets.filter(t => t.status === "open" || t.status === "in-progress");
    const overdueTickets = tickets.filter(t => {
        if (!t.slaDeadline) return false;
        const deadline = new Date(t.slaDeadline);
        return deadline < new Date() && t.status !== "resolved";
    });
    const inProgressTickets = tickets.filter(t => t.status === "in-progress");
    const resolvedToday = tickets.filter(t => {
        if (t.status !== "resolved" || !t.updatedAt) return false;
        const updated = t.updatedAt.toDate ? t.updatedAt.toDate() : new Date(t.updatedAt);
        const today = new Date();
        return updated.toDateString() === today.toDateString();
    });

    const recentTickets = tickets
        .sort((a, b) => {
            const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return bTime - aTime;
        })
        .slice(0, 5);

    const slaWarnings = tickets
        .filter(t => {
            if (!t.slaDeadline || t.status === "resolved") return false;
            const deadline = new Date(t.slaDeadline);
            const now = new Date();
            const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
            return hoursUntilDeadline > 0 && hoursUntilDeadline < 4;
        })
        .sort((a, b) => new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime())
        .slice(0, 3);

    const stats = [
        {
            name: "Open Tickets",
            value: openTickets.length.toString(),
            icon: Ticket,
            gradient: "from-blue-500 via-blue-600 to-indigo-600",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-600",
        },
        {
            name: "Overdue",
            value: overdueTickets.length.toString(),
            icon: AlertCircle,
            gradient: "from-red-500 via-red-600 to-rose-600",
            iconBg: "bg-red-500/10",
            iconColor: "text-red-600",
        },
        {
            name: "In Progress",
            value: inProgressTickets.length.toString(),
            icon: Clock,
            gradient: "from-amber-500 via-orange-500 to-yellow-600",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-600",
        },
        {
            name: "Resolved Today",
            value: resolvedToday.length.toString(),
            icon: CheckCircle2,
            gradient: "from-emerald-500 via-green-500 to-teal-600",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-600",
        },
    ];

    const priorityColors = {
        critical: "destructive",
        high: "warning",
        medium: "outline",
        low: "outline",
    };

    const statusColors = {
        open: "destructive",
        "in-progress": "warning",
        pending: "outline",
        resolved: "success",
    };

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return "Just now";
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return formatDistanceToNow(date, { addSuffix: true });
        } catch {
            return "Just now";
        }
    };

    const getTimeUntilSLA = (slaDeadline: string) => {
        const deadline = new Date(slaDeadline);
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
                        <p className="mt-2 text-blue-100">
                            Welcome back! Here's your service overview.
                        </p>
                        <div className="mt-4 flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>{customers.length} Customers</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Ticket className="h-4 w-4" />
                                <span>{tickets.length} Total Tickets</span>
                            </div>
                        </div>
                    </div>
                    <Button 
                        size="lg" 
                        className="gap-2 bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                        onClick={() => setShowNewTicketModal(true)}
                    >
                        <Plus className="h-5 w-5" />
                        New Ticket
                    </Button>
                </div>
            </div>

            {/* Stats Grid with Gradients */}
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
                                    <h3 className="mt-2 text-4xl font-bold">{stat.value}</h3>
                                </div>
                                <div className={`rounded-2xl p-4 ${stat.iconBg}`}>
                                    <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Tickets */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <CardTitle className="flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-blue-600" />
                            Recent Tickets
                        </CardTitle>
                        <Link href="/dashboard/tickets">
                            <Button variant="ghost" size="sm" className="gap-1">
                                View all
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-6">
                        {recentTickets.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <Ticket className="mx-auto h-12 w-12 mb-4 opacity-20" />
                                <p>No tickets yet. Create your first ticket!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentTickets.map((ticket) => (
                                    <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
                                        <div className="group rounded-xl border p-4 transition-all hover:border-blue-300 hover:shadow-md hover:bg-blue-50/50 dark:hover:bg-blue-950/20">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-mono font-semibold text-blue-600">
                                                            {ticket.ticketId}
                                                        </span>
                                                        <Badge variant={priorityColors[ticket.priority as keyof typeof priorityColors] as any} className="text-xs">
                                                            {ticket.priority}
                                                        </Badge>
                                                    </div>
                                                    <p className="font-medium truncate group-hover:text-blue-600 transition-colors">
                                                        {ticket.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {ticket.customer || ticket.companyName} • {formatTimestamp(ticket.createdAt)}
                                                    </p>
                                                </div>
                                                <Badge variant={statusColors[ticket.status as keyof typeof statusColors] as any}>
                                                    {ticket.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* SLA Warnings */}
                <Card className="shadow-lg">
                    <CardHeader className="border-b bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            SLA Warnings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {slaWarnings.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <CheckCircle2 className="mx-auto h-12 w-12 mb-4 text-green-500 opacity-50" />
                                <p>All tickets are within SLA!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {slaWarnings.map((ticket) => (
                                    <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
                                        <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-4 transition-all hover:shadow-lg hover:border-red-300">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-mono font-semibold text-red-600">
                                                            {ticket.ticketId}
                                                        </span>
                                                        <Badge variant="destructive" className="text-xs">
                                                            {ticket.priority}
                                                        </Badge>
                                                    </div>
                                                    <p className="font-medium text-sm">
                                                        {ticket.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {ticket.customer || ticket.companyName}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Clock className="h-3 w-3 text-red-600" />
                                                        <span className="text-xs font-semibold text-red-600">
                                                            SLA breach in {getTimeUntilSLA(ticket.slaDeadline)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* New Ticket Modal */}
            <EnhancedTicketModal
                isOpen={showNewTicketModal}
                onClose={() => setShowNewTicketModal(false)}
                onSuccess={() => setShowNewTicketModal(false)}
            />
        </div>
    );
}
