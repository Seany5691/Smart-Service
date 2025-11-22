"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    Filter,
    LayoutGrid,
    List,
    Calendar as CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import EnhancedTicketModal from "@/components/modals/EnhancedTicketModal";
import { ticketService } from "@/lib/firebase/services";
import { toast } from "sonner";

export default function TicketsPage() {
    const [viewMode, setViewMode] = useState<"kanban" | "list" | "calendar">("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [showNewTicketModal, setShowNewTicketModal] = useState(false);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Load tickets from Firebase with real-time updates
    useEffect(() => {
        setLoading(true);
        
        // Subscribe to real-time ticket updates
        const unsubscribe = ticketService.subscribeToTickets((data) => {
            setTickets(data);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Reload function for manual refresh
    const loadTickets = async () => {
        try {
            const data = await ticketService.getAll();
            setTickets(data);
        } catch (error) {
            console.error("Error loading tickets:", error);
            toast.error("Failed to load tickets");
        }
    };

    const filteredTickets = tickets.filter((ticket) =>
        ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticketId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customer?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTicketsByStatus = (status: string) => {
        return filteredTickets.filter((t) => t.status === status);
    };

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

    return (
        <div className="space-y-6">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Service Requests</h1>
                        <p className="mt-2 text-purple-100">
                            Manage and track all service tickets • {filteredTickets.length} total
                        </p>
                    </div>
                    <Button 
                        size="lg"
                        className="gap-2 bg-white text-purple-600 hover:bg-purple-50 shadow-lg" 
                        onClick={() => setShowNewTicketModal(true)}
                    >
                        <Plus className="h-5 w-5" />
                        New Ticket
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by ticket ID, title, or customer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 border-0 bg-accent/50 focus-visible:ring-2"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="gap-2 shadow-sm">
                                <Filter className="h-4 w-4" />
                                Filters
                            </Button>
                            <div className="flex items-center gap-1 rounded-lg border p-1 bg-accent/30">
                                <Button
                                    variant={viewMode === "list" ? "default" : "ghost"}
                                    size="icon"
                                    onClick={() => setViewMode("list")}
                                    className={viewMode === "list" ? "shadow-sm" : ""}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "kanban" ? "default" : "ghost"}
                                    size="icon"
                                    onClick={() => setViewMode("kanban")}
                                    className={viewMode === "kanban" ? "shadow-sm" : ""}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "calendar" ? "default" : "ghost"}
                                    size="icon"
                                    onClick={() => setViewMode("calendar")}
                                    className={viewMode === "calendar" ? "shadow-sm" : ""}
                                >
                                    <CalendarIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">Loading tickets...</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Kanban View */}
                    {viewMode === "kanban" && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {["open", "in-progress", "pending", "resolved"].map((status) => (
                                <div key={status} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold capitalize">{status.replace("-", " ")}</h3>
                                        <Badge variant="outline">{getTicketsByStatus(status).length}</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {getTicketsByStatus(status).map((ticket) => (
                                            <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
                                                <Card className="cursor-pointer transition-smooth hover:shadow-lg hover:scale-[1.02]">
                                                    <CardContent className="p-4">
                                                        <div className="space-y-2">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <span className="text-xs font-mono text-muted-foreground">
                                                                    {ticket.ticketId}
                                                                </span>
                                                                <Badge variant={priorityColors[ticket.priority as keyof typeof priorityColors] as any}>
                                                                    {ticket.priority}
                                                                </Badge>
                                                            </div>
                                                            <h4 className="font-medium line-clamp-2">{ticket.title}</h4>
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {ticket.description}
                                                            </p>
                                                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                                                <span>{ticket.customer}</span>
                                                                <span>{ticket.assignee}</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                        {getTicketsByStatus(status).length === 0 && (
                                            <Card>
                                                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                                                    No tickets
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* List View */}
                    {viewMode === "list" && (
                        <Card className="shadow-lg border-0">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Ticket ID</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Title</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Priority</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Assignee</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {filteredTickets.map((ticket) => (
                                                <tr
                                                    key={ticket.id}
                                                    className="cursor-pointer transition-all hover:bg-blue-50/50 dark:hover:bg-blue-950/20 group"
                                                    onClick={() => window.location.href = `/dashboard/tickets/${ticket.id}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                                                            {ticket.ticketId}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium group-hover:text-blue-600 transition-colors">
                                                            {ticket.title}
                                                        </div>
                                                        {ticket.subcategory && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                {ticket.subcategory}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{ticket.customer || ticket.companyName}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm capitalize">{ticket.category}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant={priorityColors[ticket.priority as keyof typeof priorityColors] as any} className="shadow-sm">
                                                            {ticket.priority}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant={statusColors[ticket.status as keyof typeof statusColors] as any} className="shadow-sm">
                                                            {ticket.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{ticket.assignee}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredTickets.length === 0 && (
                                        <div className="p-16 text-center">
                                            <Plus className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                                            <p className="text-muted-foreground mb-6">
                                                {searchQuery ? "Try adjusting your search" : "Create your first ticket to get started!"}
                                            </p>
                                            {!searchQuery && (
                                                <Button onClick={() => setShowNewTicketModal(true)} className="gap-2">
                                                    <Plus className="h-4 w-4" />
                                                    Create Ticket
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Calendar View */}
                    {viewMode === "calendar" && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
                                <p className="text-sm text-muted-foreground">
                                    Calendar view coming soon!
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* New Ticket Modal */}
            <EnhancedTicketModal
                isOpen={showNewTicketModal}
                onClose={() => setShowNewTicketModal(false)}
                onSuccess={loadTickets}
            />
        </div>
    );
}
