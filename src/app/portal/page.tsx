"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Ticket,
    Plus,
    Search,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";

const mockTickets = [
    {
        id: "TEL-2025-00123",
        title: "Phone system not working",
        status: "in-progress",
        priority: "high",
        createdAt: "2025-11-21T09:30:00",
    },
    {
        id: "COP-2025-00089",
        title: "Copier paper jam",
        status: "open",
        priority: "medium",
        createdAt: "2025-11-20T14:15:00",
    },
    {
        id: "INT-2025-00156",
        title: "Slow internet connection",
        status: "resolved",
        priority: "low",
        createdAt: "2025-11-19T11:00:00",
    },
];

export default function PortalDashboard() {
    const openTickets = mockTickets.filter(t => t.status !== "resolved").length;
    const resolvedTickets = mockTickets.filter(t => t.status === "resolved").length;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600">
                                <Ticket className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">Smart Service</h1>
                                <p className="text-xs text-muted-foreground">Customer Portal</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">ABC Corporation</span>
                            <Button variant="outline" size="sm">Logout</Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    {/* Welcome */}
                    <div>
                        <h2 className="text-3xl font-bold">Welcome back!</h2>
                        <p className="text-muted-foreground mt-1">
                            View and manage your support tickets
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Open Tickets</p>
                                        <p className="text-3xl font-bold mt-1">{openTickets}</p>
                                    </div>
                                    <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900/20">
                                        <Clock className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Resolved</p>
                                        <p className="text-3xl font-bold mt-1">{resolvedTickets}</p>
                                    </div>
                                    <div className="rounded-full p-3 bg-green-100 dark:bg-green-900/20">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Avg Response</p>
                                        <p className="text-3xl font-bold mt-1">2.3h</p>
                                    </div>
                                    <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900/20">
                                        <TrendingUp className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-4">
                        <Link href="/portal/tickets/new">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Ticket
                            </Button>
                        </Link>
                        <Link href="/portal/invoices">
                            <Button variant="outline">View Invoices</Button>
                        </Link>
                    </div>

                    {/* Recent Tickets */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Tickets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockTickets.map((ticket) => (
                                    <Link
                                        key={ticket.id}
                                        href={`/portal/tickets/${ticket.id}`}
                                        className="block"
                                    >
                                        <div className="flex items-center justify-between rounded-lg border p-4 transition-smooth hover:bg-accent/50">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                    <Ticket className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{ticket.title}</p>
                                                    <p className="text-sm text-muted-foreground">{ticket.id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant={
                                                        ticket.priority === "high" ? "warning" :
                                                            ticket.priority === "medium" ? "outline" : "outline"
                                                    }
                                                >
                                                    {ticket.priority}
                                                </Badge>
                                                <Badge
                                                    variant={
                                                        ticket.status === "resolved" ? "success" :
                                                            ticket.status === "in-progress" ? "outline" : "outline"
                                                    }
                                                >
                                                    {ticket.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
