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
} from "lucide-react";
import { ticketService } from "@/lib/firebase/services";
import { timelineService, TimelineEntry } from "@/lib/firebase/timeline";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

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
            setNewNote("");
            toast.success("Note added successfully");
        } catch (error) {
            console.error("Error adding note:", error);
            toast.error("Failed to add note");
        } finally {
            setAddingNote(false);
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
        <div className="space-y-6">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/dashboard/tickets")}
                        className="mb-4 text-white hover:bg-white/20"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold font-mono">{ticket.ticketId}</h1>
                                <Badge 
                                    variant={priorityColors[ticket.priority as keyof typeof priorityColors] as any}
                                    className="bg-white/20 border-white/30 text-white shadow-lg"
                                >
                                    {ticket.priority}
                                </Badge>
                                <Badge 
                                    variant={statusColors[ticket.status as keyof typeof statusColors] as any}
                                    className="bg-white/20 border-white/30 text-white shadow-lg"
                                >
                                    {ticket.status}
                                </Badge>
                            </div>
                            <p className="text-purple-100 text-lg">{ticket.title}</p>
                            <p className="text-purple-200 text-sm mt-2">
                                {ticket.customer || ticket.companyName} • {ticket.category}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30">
                                <Download className="h-4 w-4" />
                                PDF
                            </Button>
                            <Button variant="ghost" className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30">
                                <Edit className="h-4 w-4" />
                                Edit
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Ticket Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ticket Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Description</label>
                                <p className="mt-1">{ticket.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Customer</label>
                                    <p className="mt-1">{ticket.customer || ticket.companyName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                                    <p className="mt-1 capitalize">{ticket.category}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Subcategory</label>
                                    <p className="mt-1">{ticket.subcategory || "N/A"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Assignee</label>
                                    <p className="mt-1">{ticket.assignee}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">SLA</label>
                                    <p className="mt-1">{ticket.slaHours ? `${ticket.slaHours} Hours` : "N/A"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Created By</label>
                                    <p className="mt-1">{ticket.createdBy}</p>
                                </div>
                            </div>
                            {ticket.pbxLink && (
                                <div className="pt-4 border-t">
                                    <label className="text-sm font-medium text-muted-foreground">Cloud PBX System</label>
                                    <a 
                                        href={ticket.pbxLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="mt-2 flex items-center gap-2 text-primary hover:underline"
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
                        <CardHeader>
                            <CardTitle>Add Note</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Enter your note here..."
                                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-ring"
                            />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="publicNote"
                                        checked={isPublicNote}
                                        onChange={(e) => setIsPublicNote(e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="publicNote" className="text-sm">
                                        Send to client (visible in WhatsApp)
                                    </label>
                                </div>
                                <Button onClick={handleAddNote} disabled={addingNote}>
                                    {addingNote ? "Adding..." : "Add Note"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {timeline.map((entry, index) => (
                                    <div key={entry.id || index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                entry.isPublic ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {getTimelineIcon(entry.type)}
                                            </div>
                                            {index < timeline.length - 1 && (
                                                <div className="w-px flex-1 bg-border mt-2" style={{ minHeight: '20px' }} />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium">{entry.action}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {entry.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                        <span>{entry.userName}</span>
                                                        <span>•</span>
                                                        <span>{formatTimestamp(entry.createdAt)}</span>
                                                        {!entry.isPublic && (
                                                            <>
                                                                <span>•</span>
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

                    {/* Customer Hardware - Collapsible Card at Bottom */}
                    {ticket.hardware && ticket.hardware.length > 0 && (
                        <Card>
                            <CardContent className="p-0">
                                <details className="group">
                                    <summary className="flex items-center justify-between cursor-pointer list-none p-6 hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-5 w-5 text-muted-foreground" />
                                            <span className="font-semibold">Customer Hardware</span>
                                            <Badge variant="outline">{ticket.hardware.length} items</Badge>
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
                                    <div className="px-6 pb-6 pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Upload className="h-4 w-4" />
                                Upload Files
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Send WhatsApp
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Clock className="h-4 w-4" />
                                Log Time
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    {ticket.contactName && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                                    <p className="mt-1">{ticket.contactName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="mt-1">{ticket.contactEmail}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
