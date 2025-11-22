"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
    ChevronDown,
    Check,
    MessageSquare,
    X,
    Ticket,
} from "lucide-react";
import Link from "next/link";
import EnhancedTicketModal from "@/components/modals/EnhancedTicketModal";
import { ticketService } from "@/lib/firebase/services";
import { timelineService } from "@/lib/firebase/timeline";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState, SkeletonTable } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";

type FilterOption = "my-open" | "all" | "unassigned" | "open" | "in-progress" | "resolved";

export default function TicketsPage() {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<"kanban" | "list" | "calendar">("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [showNewTicketModal, setShowNewTicketModal] = useState(false);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterOption, setFilterOption] = useState<FilterOption>("my-open");
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showAddNoteModal, setShowAddNoteModal] = useState(false);
    const [selectedTicketForNote, setSelectedTicketForNote] = useState<any>(null);
    const [noteText, setNoteText] = useState("");
    const [isPublicNote, setIsPublicNote] = useState(true);
    const [addingNote, setAddingNote] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [selectedTicketForClose, setSelectedTicketForClose] = useState<any>(null);
    const [workDone, setWorkDone] = useState("");
    const [closingTicket, setClosingTicket] = useState(false);

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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showFilterDropdown && !target.closest('.relative')) {
                setShowFilterDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFilterDropdown]);

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

    // Handle progress change from list view
    const handleProgressChange = async (ticket: any, newProgress: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent row click
        
        try {
            // If changing to Completed, show close modal
            if (newProgress === 'Completed' && !ticket.isClosed) {
                setSelectedTicketForClose(ticket);
                setWorkDone("");
                setShowCloseModal(true);
                return;
            }

            await ticketService.update(
                ticket.id,
                { progressStatus: newProgress },
                {
                    uid: user?.uid || 'system',
                    email: user?.email || '',
                    name: user?.displayName || user?.email || 'System',
                },
                ticket
            );
            toast.success("Progress updated");
        } catch (error) {
            console.error("Error updating progress:", error);
            toast.error("Failed to update progress");
        }
    };

    // Handle close ticket from list view
    const handleCloseTicket = async () => {
        if (!workDone.trim()) {
            toast.error("Please describe the work done");
            return;
        }

        if (!selectedTicketForClose) return;

        setClosingTicket(true);
        try {
            await ticketService.closeTicket(
                selectedTicketForClose.id,
                workDone,
                {
                    uid: user?.uid || 'system',
                    email: user?.email || '',
                    name: user?.displayName || user?.email || 'System',
                }
            );
            toast.success("Ticket closed successfully");
            setShowCloseModal(false);
            setWorkDone("");
            setSelectedTicketForClose(null);
        } catch (error) {
            console.error("Error closing ticket:", error);
            toast.error("Failed to close ticket");
        } finally {
            setClosingTicket(false);
        }
    };

    // Handle add note button click
    const handleAddNoteClick = (ticket: any, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent row click
        setSelectedTicketForNote(ticket);
        setNoteText("");
        setIsPublicNote(true);
        setShowAddNoteModal(true);
    };

    // Handle add note submission
    const handleAddNote = async () => {
        if (!noteText.trim()) {
            toast.error("Please enter a note");
            return;
        }

        if (!selectedTicketForNote) return;

        setAddingNote(true);
        try {
            await timelineService.logNote(
                selectedTicketForNote.id,
                noteText,
                {
                    uid: user?.uid || 'system',
                    email: user?.email || '',
                    name: user?.displayName || user?.email || 'System',
                },
                isPublicNote
            );
            toast.success("Note added successfully");
            setShowAddNoteModal(false);
            setNoteText("");
            setSelectedTicketForNote(null);
        } catch (error) {
            console.error("Error adding note:", error);
            toast.error("Failed to add note");
        } finally {
            setAddingNote(false);
        }
    };

    // Apply filter based on selected option
    const applyFilter = (ticketList: any[]) => {
        switch (filterOption) {
            case "my-open":
                return ticketList.filter(
                    (ticket) => ticket.assigneeId === user?.uid && ticket.status !== "resolved"
                );
            case "all":
                return ticketList;
            case "unassigned":
                return ticketList.filter((ticket) => ticket.assigneeId === "unassigned");
            case "open":
                return ticketList.filter((ticket) => ticket.status === "open");
            case "in-progress":
                return ticketList.filter((ticket) => ticket.status === "in-progress");
            case "resolved":
                return ticketList.filter((ticket) => ticket.status === "resolved");
            default:
                return ticketList;
        }
    };

    // Apply search filter
    const searchFilteredTickets = tickets.filter((ticket) =>
        ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticketId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customer?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply both filters
    const filteredTickets = applyFilter(searchFilteredTickets);

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
                            <div className="relative">
                                <Button 
                                    variant="outline" 
                                    className="gap-2 shadow-sm"
                                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                >
                                    <Filter className="h-4 w-4" />
                                    {filterOption === "my-open" && "My Open Tickets"}
                                    {filterOption === "all" && "All Tickets"}
                                    {filterOption === "unassigned" && "Unassigned"}
                                    {filterOption === "open" && "Open"}
                                    {filterOption === "in-progress" && "In Progress"}
                                    {filterOption === "resolved" && "Resolved"}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                                {showFilterDropdown && (
                                    <div className="absolute top-full mt-2 right-0 z-50 min-w-[200px] rounded-lg border bg-white dark:bg-slate-950 shadow-lg">
                                        <div className="p-1">
                                            {[
                                                { value: "my-open" as FilterOption, label: "My Open Tickets" },
                                                { value: "all" as FilterOption, label: "All Tickets" },
                                                { value: "unassigned" as FilterOption, label: "Unassigned" },
                                                { value: "open" as FilterOption, label: "Open" },
                                                { value: "in-progress" as FilterOption, label: "In Progress" },
                                                { value: "resolved" as FilterOption, label: "Resolved" },
                                            ].map((option) => (
                                                <button
                                                    key={option.value}
                                                    className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                                                    onClick={() => {
                                                        setFilterOption(option.value);
                                                        setShowFilterDropdown(false);
                                                    }}
                                                >
                                                    <span>{option.label}</span>
                                                    {filterOption === option.value && (
                                                        <Check className="h-4 w-4 text-primary" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
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
                <SkeletonTable />
            ) : (
                <>
                    {/* Kanban View */}
                    {viewMode === "kanban" && (
                        <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-thin">
                            <div className="flex gap-4 lg:grid lg:grid-cols-4 min-w-max lg:min-w-0">
                                {["open", "in-progress", "pending", "resolved"].map((status) => (
                                    <div key={status} className="space-y-3 w-[280px] lg:w-auto flex-shrink-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold capitalize">{status.replace("-", " ")}</h3>
                                            <Badge variant="outline">{getTicketsByStatus(status).length}</Badge>
                                        </div>
                                        <div className="space-y-3">
                                            {getTicketsByStatus(status).map((ticket) => (
                                                <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
                                                    <Card className="cursor-pointer transition-smooth hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
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
                                                                {ticket.progressStatus && (
                                                                    <Badge 
                                                                        variant={
                                                                            ticket.progressStatus === 'Completed' ? 'success' :
                                                                            ticket.progressStatus === 'In Progress' ? 'warning' :
                                                                            'outline'
                                                                        }
                                                                        className="text-xs"
                                                                    >
                                                                        {ticket.progressStatus}
                                                                    </Badge>
                                                                )}
                                                                {ticket.isClosed && (
                                                                    <Badge variant="destructive" className="text-xs">
                                                                        CLOSED
                                                                    </Badge>
                                                                )}
                                                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                                                    <span className="truncate">{ticket.customer}</span>
                                                                    <span className="truncate ml-2">{ticket.assignee}</span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            ))}
                                            {getTicketsByStatus(status).length === 0 && (
                                                <Card className="border-dashed">
                                                    <CardContent className="p-6 lg:p-8 text-center text-sm text-muted-foreground">
                                                        No {status.replace("-", " ")} tickets
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Progress</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Assignee</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
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
                                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                        <select
                                                            value={ticket.progressStatus || 'Not Started'}
                                                            onChange={(e) => handleProgressChange(ticket, e.target.value, e as any)}
                                                            disabled={ticket.isClosed}
                                                            className="rounded-md border border-input bg-transparent px-2 py-1 text-sm focus-ring disabled:opacity-50 cursor-pointer"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <option value="Not Started">Not Started</option>
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="Awaiting Customer">Awaiting Customer</option>
                                                            <option value="Completed">Completed</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={statusColors[ticket.status as keyof typeof statusColors] as any} className="shadow-sm">
                                                                {ticket.status}
                                                            </Badge>
                                                            {ticket.isClosed && (
                                                                <Badge variant="destructive" className="shadow-sm">
                                                                    CLOSED
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{ticket.assignee}</td>
                                                    <td className="px-6 py-4">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="gap-2"
                                                            onClick={(e) => handleAddNoteClick(ticket, e)}
                                                        >
                                                            <MessageSquare className="h-4 w-4" />
                                                            Add Note
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredTickets.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="p-0">
                                                <div className="p-8 lg:p-16">
                                                    <EmptyState
                                                        icon={Ticket}
                                                        title="No tickets found"
                                                        description={searchQuery ? "Try adjusting your search filters" : "Create your first ticket to get started!"}
                                                        actionLabel={!searchQuery ? "Create Ticket" : undefined}
                                                        onAction={!searchQuery ? () => setShowNewTicketModal(true) : undefined}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
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

            {/* Add Note Modal */}
            {showAddNoteModal && selectedTicketForNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-card rounded-lg shadow-lg w-full max-w-md m-4">
                        <div className="flex items-center justify-between border-b p-6">
                            <div>
                                <h2 className="text-xl font-bold">Add Note</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedTicketForNote.ticketId} - {selectedTicketForNote.title}
                                </p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                    setShowAddNoteModal(false);
                                    setNoteText("");
                                    setSelectedTicketForNote(null);
                                }}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Note *</label>
                                <textarea
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="Enter your note here..."
                                    className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-ring"
                                    autoFocus
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="publicNoteModal"
                                    checked={isPublicNote}
                                    onChange={(e) => setIsPublicNote(e.target.checked)}
                                    className="rounded"
                                />
                                <label htmlFor="publicNoteModal" className="text-sm">
                                    Send to client (visible in WhatsApp)
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowAddNoteModal(false);
                                        setNoteText("");
                                        setSelectedTicketForNote(null);
                                    }}
                                    disabled={addingNote}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleAddNote}
                                    disabled={addingNote || !noteText.trim()}
                                >
                                    {addingNote ? "Adding..." : "Add Note"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Close Ticket Modal */}
            {showCloseModal && selectedTicketForClose && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-card rounded-lg shadow-lg w-full max-w-md m-4">
                        <div className="flex items-center justify-between border-b p-6">
                            <div>
                                <h2 className="text-xl font-bold">Close Ticket</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedTicketForClose.ticketId} - {selectedTicketForClose.title}
                                </p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                    setShowCloseModal(false);
                                    setWorkDone("");
                                    setSelectedTicketForClose(null);
                                }}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Work Done *</label>
                                <textarea
                                    value={workDone}
                                    onChange={(e) => setWorkDone(e.target.value)}
                                    placeholder="Describe the work that was completed..."
                                    className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-ring"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowCloseModal(false);
                                        setWorkDone("");
                                        setSelectedTicketForClose(null);
                                    }}
                                    disabled={closingTicket}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleCloseTicket}
                                    disabled={closingTicket || !workDone.trim()}
                                    variant="destructive"
                                >
                                    {closingTicket ? "Closing..." : "Close Ticket"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
