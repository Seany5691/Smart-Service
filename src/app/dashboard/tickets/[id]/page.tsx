"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft,
    Clock,
    User,
    MessageSquare,
    FileText,
    Upload,
    Edit,
    Trash2,
    Download,
    Package,
    X,
    CheckSquare,
} from "lucide-react";
import { ticketService } from "@/lib/firebase/services";
import { timelineService, TimelineEntry } from "@/lib/firebase/timeline";
import { taskService } from "@/lib/firebase/tasks";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import TicketPrintTemplate from "@/components/TicketPrintTemplate";
import AddTaskModal from "@/components/modals/AddTaskModal";

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const ticketId = params.id as string;

    const [ticket, setTicket] = useState<any>(null);
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState("");
    const [isPublicNote, setIsPublicNote] = useState(true);
    const [addingNote, setAddingNote] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [showReopenModal, setShowReopenModal] = useState(false);
    const [workDone, setWorkDone] = useState("");
    const [reopenReason, setReopenReason] = useState("");
    const [processingAction, setProcessingAction] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [pinToTasks, setPinToTasks] = useState(false);

    // Load ticket and timeline
    useEffect(() => {
        if (!ticketId) return;

        setLoading(true);

        // Subscribe to ticket updates
        const unsubscribeTicket = ticketService.subscribeToTicket(ticketId, (data) => {
            setTicket(data);
            setLoading(false);
        });

        // Subscribe to timeline updates
        const unsubscribeTimeline = timelineService.subscribeToTicketTimeline(ticketId, (entries) => {
            setTimeline(entries);
        });

        return () => {
            unsubscribeTicket();
            unsubscribeTimeline();
        };
    }, [ticketId]);

    const handleAddNote = async () => {
        if (!newNote.trim()) {
            toast.error("Please enter a note");
            return;
        }

        setAddingNote(true);
        try {
            await timelineService.logNote(
                ticketId,
                newNote,
                {
                    uid: user?.uid || 'system',
                    email: user?.email || '',
                    name: user?.displayName || user?.email || 'System',
                },
                isPublicNote
            );

            // If "Pin to Tasks" is checked, create a task
            if (pinToTasks && user) {
                await taskService.create({
                    description: newNote,
                    customerId: ticket?.companyId,
                    customerName: ticket?.customer || ticket?.companyName,
                    ticketId: ticketId,
                    ticketNumber: ticket?.ticketId,
                    createdBy: user.uid,
                    createdByName: user.displayName || user.email || 'Unknown',
                    createdByEmail: user.email || '',
                    completed: false,
                    source: 'note_pin',
                }, {
                    uid: user.uid,
                    name: user.displayName || user.email || 'Unknown',
                    email: user.email || '',
                });
            }

            setNewNote("");
            setPinToTasks(false);
            toast.success(pinToTasks ? "Note added and pinned to tasks!" : "Note added successfully");
        } catch (error) {
            console.error("Error adding note:", error);
            toast.error("Failed to add note");
        } finally {
            setAddingNote(false);
        }
    };

    const handleProgressChange = async (newProgress: string) => {
        if (!ticket) return;

        try {
            const oldProgress = ticket.progressStatus || 'Not Started';
            
            // If changing to Completed, show close modal
            if (newProgress === 'Completed') {
                setShowCloseModal(true);
                return;
            }

            await ticketService.update(
                ticketId,
                { progressStatus: newProgress },
                {
                    uid: user?.uid || 'system',
                    email: user?.email || '',
                    name: user?.displayName || user?.email || 'System',
                },
                ticket
            );
            toast.success("Progress status updated");
        } catch (error) {
            console.error("Error updating progress:", error);
            toast.error("Failed to update progress");
        }
    };

    const handleCloseTicket = async () => {
        if (!workDone.trim()) {
            toast.error("Please describe the work done");
            return;
        }

        setProcessingAction(true);
        try {
            await ticketService.closeTicket(
                ticketId,
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
        } catch (error) {
            console.error("Error closing ticket:", error);
            toast.error("Failed to close ticket");
        } finally {
            setProcessingAction(false);
        }
    };

    const handleReopenTicket = async () => {
        if (!reopenReason.trim()) {
            toast.error("Please provide a reason for reopening");
            return;
        }

        setProcessingAction(true);
        try {
            await ticketService.reopenTicket(
                ticketId,
                reopenReason,
                {
                    uid: user?.uid || 'system',
                    email: user?.email || '',
                    name: user?.displayName || user?.email || 'System',
                }
            );
            toast.success("Ticket reopened successfully");
            setShowReopenModal(false);
            setReopenReason("");
        } catch (error) {
            console.error("Error reopening ticket:", error);
            toast.error("Failed to reopen ticket");
        } finally {
            setProcessingAction(false);
        }
    };

    const calculateDuration = (startDate: any, endDate?: any) => {
        const start = startDate?.toDate ? startDate.toDate() : new Date(startDate);
        const end = endDate ? (endDate.toDate ? endDate.toDate() : new Date(endDate)) : new Date();
        
        const diffMs = end.getTime() - start.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffDays > 0) {
            return `${diffDays}d ${diffHours}h ${diffMinutes}m`;
        } else if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m`;
        } else {
            return `${diffMinutes}m`;
        }
    };

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return "Just now";
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return format(date, "MMM dd, yyyy HH:mm");
        } catch {
            return "Just now";
        }
    };

    const getTimelineIcon = (type: string) => {
        switch (type) {
            case 'created':
                return <FileText className="h-4 w-4" />;
            case 'status_changed':
                return <Clock className="h-4 w-4" />;
            case 'assigned':
                return <User className="h-4 w-4" />;
            case 'note_added':
                return <MessageSquare className="h-4 w-4" />;
            case 'file_uploaded':
                return <Upload className="h-4 w-4" />;
            case 'progress_changed':
                return <Clock className="h-4 w-4" />;
            case 'ticket_closed':
                return <FileText className="h-4 w-4" />;
            case 'ticket_reopened':
                return <FileText className="h-4 w-4" />;
            case 'priority_changed':
                return <Clock className="h-4 w-4" />;
            case 'category_changed':
                return <FileText className="h-4 w-4" />;
            case 'subcategory_changed':
                return <FileText className="h-4 w-4" />;
            case 'sla_changed':
                return <Clock className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading ticket...</p>
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Ticket not found</p>
                <Button onClick={() => router.push("/dashboard/tickets")} className="mt-4">
                    Back to Tickets
                </Button>
            </div>
        );
    }

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
        <div className="space-y-4 lg:space-y-6">
            {/* Header with Gradient - Mobile Optimized */}
            <div className="relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4 sm:p-6 lg:p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative">
                    {/* Mobile: Prominent back button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/dashboard/tickets")}
                        className="mb-3 lg:mb-4 text-white hover:bg-white/20 h-11 w-11 lg:h-10 lg:w-10"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    {/* Mobile: Stack content vertically, Desktop: Side by side */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 lg:gap-3 mb-2 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono">{ticket.ticketId}</h1>
                                <Badge 
                                    variant={priorityColors[ticket.priority as keyof typeof priorityColors] as any}
                                    className="bg-white/20 border-white/30 text-white shadow-lg text-xs lg:text-sm"
                                >
                                    {ticket.priority}
                                </Badge>
                                <Badge 
                                    variant={statusColors[ticket.status as keyof typeof statusColors] as any}
                                    className="bg-white/20 border-white/30 text-white shadow-lg text-xs lg:text-sm"
                                >
                                    {ticket.status}
                                </Badge>
                                {ticket.isClosed && (
                                    <Badge className="bg-red-500/80 border-red-300 text-white shadow-lg text-xs lg:text-sm">
                                        CLOSED
                                    </Badge>
                                )}
                            </div>
                            <p className="text-purple-100 text-base lg:text-lg">{ticket.title}</p>
                            <p className="text-purple-200 text-sm mt-2">
                                {ticket.customer || ticket.companyName} • {ticket.category}
                            </p>
                            
                            {/* Time Tracking - Mobile: Stack vertically */}
                            <div className="mt-3 lg:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm">
                                {ticket.isClosed ? (
                                    <>
                                        <div className="bg-white/10 px-3 py-1.5 rounded">
                                            <span className="text-purple-200">Completed in: </span>
                                            <span className="font-semibold">{calculateDuration(ticket.createdAt, ticket.closedAt)}</span>
                                        </div>
                                        <div className="bg-white/10 px-3 py-1.5 rounded">
                                            <span className="text-purple-200">Closed: </span>
                                            <span className="font-semibold">{calculateDuration(ticket.closedAt)} ago</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-white/10 px-3 py-1.5 rounded">
                                        <span className="text-purple-200">Open for: </span>
                                        <span className="font-semibold">{calculateDuration(ticket.createdAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Mobile: Full width button, Desktop: Normal */}
                        <div className="flex gap-2 w-full lg:w-auto">
                            <Button 
                                variant="ghost" 
                                className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 flex-1 lg:flex-none h-11 lg:h-10"
                                onClick={() => window.print()}
                            >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Print Report</span>
                                <span className="sm:hidden">Print</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile: Single column, Desktop: 2/3 + 1/3 layout */}
            <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                    {/* Progress Status & Actions */}
                    <Card>
                        <CardHeader className="p-4 lg:p-6">
                            <CardTitle className="text-base lg:text-lg">Progress Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-4 lg:p-6 pt-0 lg:pt-0">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Current Progress</label>
                                {/* Mobile: Larger touch target */}
                                <select
                                    value={ticket.progressStatus || 'Not Started'}
                                    onChange={(e) => handleProgressChange(e.target.value)}
                                    disabled={ticket.isClosed}
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring disabled:opacity-50"
                                >
                                    <option value="Not Started">Not Started</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Awaiting Customer">Awaiting Customer</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            
                            {/* Mobile: Full width button with proper touch target */}
                            <div className="pt-4 border-t flex gap-2">
                                {ticket.isClosed ? (
                                    <Button 
                                        onClick={() => setShowReopenModal(true)}
                                        className="w-full h-11 lg:h-10"
                                        variant="outline"
                                    >
                                        Reopen Ticket
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={() => setShowCloseModal(true)}
                                        className="w-full h-11 lg:h-10"
                                        variant="destructive"
                                    >
                                        Close Ticket
                                    </Button>
                                )}
                            </div>

                            {ticket.isClosed && ticket.workDone && (
                                <div className="pt-4 border-t">
                                    <label className="text-sm font-medium text-muted-foreground">Work Done</label>
                                    <p className="mt-1 text-sm">{ticket.workDone}</p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Closed by {ticket.closedBy} on {formatTimestamp(ticket.closedAt)}
                                    </p>
                                </div>
                            )}

                            {ticket.reopenReason && (
                                <div className="pt-4 border-t">
                                    <label className="text-sm font-medium text-muted-foreground">Reopen Reason</label>
                                    <p className="mt-1 text-sm">{ticket.reopenReason}</p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Reopened by {ticket.reopenedBy} on {formatTimestamp(ticket.reopenedAt)}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Ticket Details */}
                    <Card>
                        <CardHeader className="p-4 lg:p-6">
                            <CardTitle className="text-base lg:text-lg">Ticket Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-4 lg:p-6 pt-0 lg:pt-0">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Description</label>
                                <p className="mt-1 text-sm lg:text-base">{ticket.description}</p>
                            </div>
                            {/* Mobile: Single column, Desktop: 2 columns */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Customer</label>
                                    <p className="mt-1 text-sm lg:text-base">{ticket.customer || ticket.companyName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                                    <p className="mt-1 capitalize text-sm lg:text-base">{ticket.category}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Subcategory</label>
                                    <p className="mt-1 text-sm lg:text-base">{ticket.subcategory || "N/A"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Assignee</label>
                                    <p className="mt-1 text-sm lg:text-base">{ticket.assignee}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">SLA</label>
                                    <p className="mt-1 text-sm lg:text-base">{ticket.slaHours ? `${ticket.slaHours} Hours` : "N/A"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Created By</label>
                                    <p className="mt-1 text-sm lg:text-base">{ticket.createdBy}</p>
                                </div>
                            </div>
                            {ticket.pbxLink && (
                                <div className="pt-4 border-t">
                                    <label className="text-sm font-medium text-muted-foreground">Cloud PBX System</label>
                                    <a 
                                        href={ticket.pbxLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="mt-2 flex items-center gap-2 text-primary hover:underline active:text-primary/80 min-h-[44px] py-2"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Access PBX System
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Add Note */}
                    <Card>
                        <CardHeader className="p-4 lg:p-6">
                            <CardTitle className="text-base lg:text-lg">Add Note</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-4 lg:p-6 pt-0 lg:pt-0">
                            {/* Mobile: Larger text area with better touch target */}
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Enter your note here..."
                                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring"
                            />
                            <div className="space-y-3">
                                {/* Mobile: Stack checkboxes vertically */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                    <div className="flex items-center gap-2 min-h-[44px]">
                                        <input
                                            type="checkbox"
                                            id="publicNote"
                                            checked={isPublicNote}
                                            onChange={(e) => setIsPublicNote(e.target.checked)}
                                            className="rounded h-5 w-5 lg:h-4 lg:w-4"
                                        />
                                        <label htmlFor="publicNote" className="text-sm lg:text-sm cursor-pointer">
                                            Send to client (visible in WhatsApp)
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2 min-h-[44px]">
                                        <input
                                            type="checkbox"
                                            id="pinToTasks"
                                            checked={pinToTasks}
                                            onChange={(e) => setPinToTasks(e.target.checked)}
                                            className="rounded h-5 w-5 lg:h-4 lg:w-4"
                                        />
                                        <label htmlFor="pinToTasks" className="text-sm lg:text-sm cursor-pointer">
                                            Pin to Tasks
                                        </label>
                                    </div>
                                </div>
                                {/* Mobile: Full width button */}
                                <div className="flex justify-end">
                                    <Button 
                                        onClick={handleAddNote} 
                                        disabled={addingNote}
                                        className="w-full sm:w-auto h-11 lg:h-10"
                                    >
                                        {addingNote ? "Adding..." : "Add Note"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline - Mobile Optimized */}
                    <Card>
                        <CardHeader className="p-4 lg:p-6">
                            <CardTitle className="text-base lg:text-lg">Activity Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 lg:p-6 pt-0 lg:pt-0">
                            <div className="space-y-3 lg:space-y-4">
                                {timeline.map((entry, index) => (
                                    <div key={entry.id || index} className="flex gap-3 lg:gap-4">
                                        {/* Mobile: Smaller icon, reduced padding */}
                                        <div className="flex flex-col items-center">
                                            <div className={`flex h-8 w-8 lg:h-8 lg:w-8 items-center justify-center rounded-full ${
                                                entry.type === 'ticket_closed' ? 'bg-red-100 text-red-600' :
                                                entry.type === 'ticket_reopened' ? 'bg-green-100 text-green-600' :
                                                entry.isPublic ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {getTimelineIcon(entry.type)}
                                            </div>
                                            {index < timeline.length - 1 && (
                                                <div className="w-px flex-1 bg-border mt-2" style={{ minHeight: '20px' }} />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-3 lg:pb-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm lg:text-base">{entry.action}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {entry.description}
                                                    </p>
                                                    
                                                    {/* Show work done for closed tickets */}
                                                    {entry.type === 'ticket_closed' && entry.metadata?.workDone && (
                                                        <div className="mt-2 p-2 lg:p-3 bg-accent/50 rounded border">
                                                            <p className="text-xs font-medium text-muted-foreground mb-1">Work Done:</p>
                                                            <p className="text-sm">{entry.metadata.workDone}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Show reason for reopened tickets */}
                                                    {entry.type === 'ticket_reopened' && entry.metadata?.reason && (
                                                        <div className="mt-2 p-2 lg:p-3 bg-accent/50 rounded border">
                                                            <p className="text-xs font-medium text-muted-foreground mb-1">Reason:</p>
                                                            <p className="text-sm">{entry.metadata.reason}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Mobile: Stack metadata vertically on very small screens */}
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            <span>{entry.userName}</span>
                                                        </div>
                                                        <span className="hidden sm:inline">•</span>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{formatTimestamp(entry.createdAt)}</span>
                                                        </div>
                                                        {!entry.isPublic && (
                                                            <>
                                                                <span className="hidden sm:inline">•</span>
                                                                <Badge variant="outline" className="text-xs">Internal</Badge>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {timeline.length === 0 && (
                                    <p className="text-center text-muted-foreground py-8">
                                        No activity yet
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Hardware - Collapsible Card at Bottom - Mobile Optimized */}
                    {ticket.hardware && ticket.hardware.length > 0 && (
                        <Card>
                            <CardContent className="p-0">
                                <details className="group">
                                    <summary className="flex items-center justify-between cursor-pointer list-none p-4 lg:p-6 hover:bg-accent/50 active:bg-accent transition-colors min-h-[56px]">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-5 w-5 text-muted-foreground" />
                                            <span className="font-semibold text-sm lg:text-base">Customer Hardware</span>
                                            <Badge variant="outline" className="text-xs">{ticket.hardware.length} items</Badge>
                                        </div>
                                        <svg
                                            className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </summary>
                                    <div className="px-4 lg:px-6 pb-4 lg:pb-6 pt-2">
                                        {/* Mobile: Single column, Desktop: 2 columns */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                            {ticket.hardware.map((item: any, index: number) => (
                                                <div key={index} className="p-3 bg-accent/50 rounded border space-y-1">
                                                    <p className="font-medium text-sm">{item.label}</p>
                                                    {item.nickname && (
                                                        <p className="text-xs text-muted-foreground italic">"{item.nickname}"</p>
                                                    )}
                                                    {item.serialNumber && (
                                                        <p className="text-xs text-muted-foreground">Serial: {item.serialNumber}</p>
                                                    )}
                                                    {item.macAddress && (
                                                        <p className="text-xs text-muted-foreground">MAC: {item.macAddress}</p>
                                                    )}
                                                    {item.ipAddress && (
                                                        <p className="text-xs text-muted-foreground">IP: {item.ipAddress}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </details>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Mobile Optimized */}
                <div className="space-y-4 lg:space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="p-4 lg:p-6">
                            <CardTitle className="text-base lg:text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 p-4 lg:p-6 pt-0 lg:pt-0">
                            {/* Mobile: Larger touch targets (44px min) */}
                            <Button 
                                variant="outline" 
                                className="w-full justify-start gap-2 h-11 lg:h-10"
                                onClick={() => setShowAddTaskModal(true)}
                            >
                                <CheckSquare className="h-4 w-4" />
                                Add Task
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2 h-11 lg:h-10">
                                <Upload className="h-4 w-4" />
                                Upload Files
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2 h-11 lg:h-10">
                                <MessageSquare className="h-4 w-4" />
                                Send WhatsApp
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2 h-11 lg:h-10">
                                <Clock className="h-4 w-4" />
                                Log Time
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    {ticket.contactName && (
                        <Card>
                            <CardHeader className="p-4 lg:p-6">
                                <CardTitle className="text-base lg:text-lg">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 p-4 lg:p-6 pt-0 lg:pt-0">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                                    <p className="mt-1 text-sm lg:text-base">{ticket.contactName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="mt-1 text-sm lg:text-base">{ticket.contactEmail}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Close Ticket Modal - Mobile Optimized */}
            {showCloseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card rounded-lg shadow-lg w-full max-w-md">
                        <div className="flex items-center justify-between border-b p-4 lg:p-6">
                            <h2 className="text-lg lg:text-xl font-bold">Close Ticket</h2>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setShowCloseModal(false)}
                                className="h-11 w-11 lg:h-10 lg:w-10"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="p-4 lg:p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Work Done *</label>
                                <textarea
                                    value={workDone}
                                    onChange={(e) => setWorkDone(e.target.value)}
                                    placeholder="Describe the work that was completed..."
                                    className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowCloseModal(false);
                                        setWorkDone("");
                                    }}
                                    disabled={processingAction}
                                    className="h-11 lg:h-10 w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleCloseTicket}
                                    disabled={processingAction || !workDone.trim()}
                                    variant="destructive"
                                    className="h-11 lg:h-10 w-full sm:w-auto"
                                >
                                    {processingAction ? "Closing..." : "Close Ticket"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reopen Ticket Modal - Mobile Optimized */}
            {showReopenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card rounded-lg shadow-lg w-full max-w-md">
                        <div className="flex items-center justify-between border-b p-4 lg:p-6">
                            <h2 className="text-lg lg:text-xl font-bold">Reopen Ticket</h2>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setShowReopenModal(false)}
                                className="h-11 w-11 lg:h-10 lg:w-10"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="p-4 lg:p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Reason for Reopening *</label>
                                <textarea
                                    value={reopenReason}
                                    onChange={(e) => setReopenReason(e.target.value)}
                                    placeholder="Explain why this ticket needs to be reopened..."
                                    className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowReopenModal(false);
                                        setReopenReason("");
                                    }}
                                    disabled={processingAction}
                                    className="h-11 lg:h-10 w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleReopenTicket}
                                    disabled={processingAction || !reopenReason.trim()}
                                    className="h-11 lg:h-10 w-full sm:w-auto"
                                >
                                    {processingAction ? "Reopening..." : "Reopen Ticket"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Task Modal */}
            <AddTaskModal
                isOpen={showAddTaskModal}
                onClose={() => setShowAddTaskModal(false)}
                onSuccess={() => {
                    setShowAddTaskModal(false);
                    toast.success("Task created successfully!");
                }}
                prefilledCustomerId={ticket?.companyId}
                prefilledCustomerName={ticket?.customer || ticket?.companyName}
                prefilledTicketId={ticketId}
                prefilledTicketNumber={ticket?.ticketId}
                source="ticket"
                allowAssignment={true}
            />

            {/* Print Template - Hidden on screen, visible when printing */}
            <TicketPrintTemplate ticket={ticket} timeline={timeline} />
        </div>
    );
}
