"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Briefcase,
    Ticket,
    Clock,
    Building2,
} from "lucide-react";
import { customerService, ticketService } from "@/lib/firebase/services";
import { toast } from "sonner";
import { format } from "date-fns";
import EnhancedTicketModal from "@/components/modals/EnhancedTicketModal";
import Link from "next/link";

export default function ContactDetailPage() {
    const params = useParams();
    const router = useRouter();
    const customerId = params.id as string;
    const contactId = params.contactId as string;

    const [customer, setCustomer] = useState<any>(null);
    const [contact, setContact] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTicketModal, setShowTicketModal] = useState(false);

    // Load customer, contact, and tickets
    useEffect(() => {
        if (!customerId || !contactId) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const customerData: any = await customerService.getById(customerId);
                setCustomer(customerData);

                // Find the specific contact
                const foundContact = customerData?.contacts?.find((c: any) => c.id === contactId);
                setContact(foundContact);

                // Get all tickets for this company
                const allTickets = await ticketService.getByCompanyId(customerId);
                
                // Filter tickets for this specific contact
                const contactTickets = allTickets.filter((t: any) => t.contactId === contactId);
                setTickets(contactTickets);
            } catch (error) {
                console.error("Error loading contact:", error);
                toast.error("Failed to load contact");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [customerId, contactId]);

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return "N/A";
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return format(date, "MMM dd, yyyy");
        } catch {
            return "N/A";
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading contact...</p>
                </div>
            </div>
        );
    }

    if (!contact || !customer) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Contact not found</p>
                <Button onClick={() => router.push(`/dashboard/customers/${customerId}`)} className="mt-4">
                    Back to Customer
                </Button>
            </div>
        );
    }

    const openTickets = tickets.filter(t => t.status === "open" || t.status === "in-progress");

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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/customers/${customerId}`)}
                        className="mb-4 text-white hover:bg-white/20"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                                <User className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold">
                                    {contact.firstName} {contact.lastName}
                                </h1>
                                <p className="text-blue-100 mt-2">
                                    {contact.role || "Contact"} at {customer.companyName}
                                </p>
                            </div>
                        </div>
                        <Button 
                            size="lg"
                            className="gap-2 bg-white text-blue-600 hover:bg-blue-50 shadow-lg" 
                            onClick={() => setShowTicketModal(true)}
                        >
                            <Ticket className="h-5 w-5" />
                            Create Ticket
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="text-4xl font-bold">{openTickets.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Open Tickets</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="text-4xl font-bold">{tickets.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total Tickets</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="text-4xl font-bold">
                            {tickets.filter(t => t.status === "resolved").length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Resolved</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="text-4xl font-bold">
                            {tickets.filter(t => t.priority === "critical" || t.priority === "high").length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">High Priority</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                    <p className="mt-1">{contact.firstName} {contact.lastName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Role/Position</label>
                                    <p className="mt-1">{contact.role || "N/A"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="mt-1">{contact.email || "N/A"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Cell Number</label>
                                    <p className="mt-1">{contact.cellNumber || "N/A"}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <label className="text-sm font-medium text-muted-foreground">Company</label>
                                <div 
                                    className="mt-2 flex items-center gap-3 p-3 border rounded-lg bg-accent/50 cursor-pointer hover:bg-accent transition-colors"
                                    onClick={() => router.push(`/dashboard/customers/${customerId}`)}
                                >
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{customer.companyName}</p>
                                        <p className="text-sm text-muted-foreground">{customer.city || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service Requests */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Requests ({tickets.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {tickets.length === 0 ? (
                                <div className="text-center py-8">
                                    <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground mb-4">No service requests yet</p>
                                    <Button onClick={() => setShowTicketModal(true)}>
                                        <Ticket className="h-4 w-4 mr-2" />
                                        Create First Ticket
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tickets.map((ticket) => (
                                        <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
                                            <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-mono font-medium">
                                                            {ticket.ticketId}
                                                        </span>
                                                        <Badge variant={priorityColors[ticket.priority as keyof typeof priorityColors] as any}>
                                                            {ticket.priority}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm font-medium">{ticket.title}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {formatTimestamp(ticket.createdAt)}
                                                    </p>
                                                </div>
                                                <Badge variant={statusColors[ticket.status as keyof typeof statusColors] as any}>
                                                    {ticket.status}
                                                </Badge>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setShowTicketModal(true)}>
                                <Ticket className="h-4 w-4" />
                                Create Ticket
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start gap-2"
                                onClick={() => router.push(`/dashboard/customers/${customerId}`)}
                            >
                                <Building2 className="h-4 w-4" />
                                View Company
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Contact Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {contact.email && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <p className="text-sm font-medium truncate">{contact.email}</p>
                                    </div>
                                </div>
                            )}
                            {contact.cellNumber && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground">Cell Number</p>
                                        <p className="text-sm font-medium">{contact.cellNumber}</p>
                                    </div>
                                </div>
                            )}
                            {contact.role && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground">Role</p>
                                        <p className="text-sm font-medium">{contact.role}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {tickets.length > 0 && (
                                    <>
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <Ticket className="h-4 w-4" />
                                                </div>
                                                <div className="w-px flex-1 bg-border mt-2" style={{ minHeight: '20px' }} />
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className="font-medium">Latest Ticket</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {tickets[0]?.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatTimestamp(tickets[0]?.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <Clock className="h-4 w-4" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">First Ticket</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatTimestamp(tickets[tickets.length - 1]?.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {tickets.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No activity yet
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create Ticket Modal with Prefilled Data */}
            <EnhancedTicketModal
                isOpen={showTicketModal}
                onClose={() => setShowTicketModal(false)}
                onSuccess={() => {
                    // Reload tickets
                    ticketService.getByCompanyId(customerId).then(allTickets => {
                        const contactTickets = allTickets.filter((t: any) => t.contactId === contactId);
                        setTickets(contactTickets);
                    });
                    setShowTicketModal(false);
                }}
                prefilledCompanyId={customerId}
                prefilledCompanyName={customer.companyName}
                prefilledContactId={contactId}
                prefilledContactName={`${contact.firstName} ${contact.lastName}`}
                prefilledContactEmail={contact.email}
            />
        </div>
    );
}
