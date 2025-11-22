"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    MapPin,
    User,
    Plus,
    Edit,
    Ticket,
    Clock,
    Package,
    Trash2,
    CheckSquare,
} from "lucide-react";
import { customerService, ticketService } from "@/lib/firebase/services";
import { hardwareService } from "@/lib/firebase/hardware";
import { taskService, Task } from "@/lib/firebase/tasks";
import { toast } from "sonner";
import { format } from "date-fns";
import AddContactModal from "@/components/modals/AddContactModal";
import CustomerModal from "@/components/modals/CustomerModal";
import EnhancedTicketModal from "@/components/modals/EnhancedTicketModal";
import AddHardwareModal from "@/components/modals/AddHardwareModal";
import AddTaskModal from "@/components/modals/AddTaskModal";
import TaskCard from "@/components/TaskCard";
import ConfirmModal from "@/components/modals/ConfirmModal";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const customerId = params.id as string;

    const [customer, setCustomer] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [hardware, setHardware] = useState<any[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showHardwareModal, setShowHardwareModal] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false);
    const [hardwareToDelete, setHardwareToDelete] = useState<string | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"details" | "contacts" | "tickets" | "hardware" | "tasks" | "documents">("details");

    // Load customer and tickets
    useEffect(() => {
        if (!customerId) return;

        const loadData = async () => {
            setLoading(true);
            try {
                // Load customer first (most important)
                const customerData = await customerService.getById(customerId);
                setCustomer(customerData);

                // Load tickets and hardware separately (don't fail if these error)
                try {
                    const ticketsData = await ticketService.getByCompanyId(customerId);
                    setTickets(ticketsData);
                } catch (ticketError) {
                    console.error("Error loading tickets:", ticketError);
                    setTickets([]);
                }

                try {
                    const hardwareData = await hardwareService.getByCustomerId(customerId);
                    setHardware(hardwareData);
                } catch (hardwareError) {
                    console.error("Error loading hardware:", hardwareError);
                    setHardware([]);
                }

                try {
                    const tasksData = await taskService.getByCustomer(customerId);
                    setTasks(tasksData);
                } catch (taskError) {
                    console.error("Error loading tasks:", taskError);
                    setTasks([]);
                }
            } catch (error) {
                console.error("Error loading customer:", error);
                toast.error("Failed to load customer");
            } finally {
                setLoading(false);
            }
        };

        loadData();

        // Subscribe to customer tasks (with error handling)
        let unsubscribeTasks: (() => void) | undefined;
        try {
            unsubscribeTasks = taskService.subscribeToCustomerTasks(customerId, (data) => {
                setTasks(data);
            });
        } catch (error) {
            console.error("Error subscribing to customer tasks:", error);
            // Indexes might still be building, tasks will load from initial query
        }

        return () => {
            if (unsubscribeTasks) {
                try {
                    unsubscribeTasks();
                } catch (error) {
                    console.error("Error unsubscribing from tasks:", error);
                }
            }
        };
    }, [customerId]);

    const handleContactSuccess = () => {
        // Reload customer data
        customerService.getById(customerId).then(setCustomer);
        toast.success("Contact added successfully!");
        setShowContactModal(false);
    };

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return "N/A";
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return format(date, "MMM dd, yyyy");
        } catch {
            return "N/A";
        }
    };

    // Task handlers
    const handleCompleteTask = async (taskId: string) => {
        try {
            await taskService.complete(taskId, {
                uid: user?.uid || '',
                name: user?.displayName || user?.email || 'Unknown',
                email: user?.email || ''
            });
            toast.success("Task completed!");
        } catch (error) {
            console.error("Error completing task:", error);
            toast.error("Failed to complete task");
        }
    };

    const handleUncompleteTask = async (taskId: string) => {
        try {
            await taskService.uncomplete(taskId);
            toast.success("Task marked as incomplete");
        } catch (error) {
            console.error("Error uncompleting task:", error);
            toast.error("Failed to update task");
        }
    };

    const handleDeleteTask = async () => {
        if (!taskToDelete) return;
        
        try {
            await taskService.delete(taskToDelete);
            toast.success("Task deleted");
            setShowDeleteTaskConfirm(false);
            setTaskToDelete(null);
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Failed to delete task");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading customer...</p>
                </div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Customer not found</p>
                <Button onClick={() => router.push("/dashboard/customers")} className="mt-4">
                    Back to Customers
                </Button>
            </div>
        );
    }

    const openTickets = tickets.filter(t => t.status === "open" || t.status === "in-progress");
    const contacts = customer.contacts || [];

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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/dashboard/customers")}
                        className="mb-4 text-white hover:bg-white/20"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                                <Building2 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold">{customer.companyName}</h1>
                                <p className="text-emerald-100 mt-2">
                                    {customer.regNumber || "No registration number"}
                                </p>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
                            onClick={() => setShowEditModal(true)}
                        >
                            <Edit className="h-4 w-4" />
                            Edit Company
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-5">
                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="text-4xl font-bold">{contacts.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Contacts</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="text-4xl font-bold">{customer.sites || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Sites</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="text-4xl font-bold">{openTickets.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Open Tickets</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="text-4xl font-bold">{tickets.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total Tickets</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="text-4xl font-bold">{hardware.reduce((sum, h) => sum + h.quantity, 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Hardware Items</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="border-b">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab("details")}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "details"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Company Details
                    </button>
                    <button
                        onClick={() => setActiveTab("contacts")}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "contacts"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Contacts ({contacts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("tickets")}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "tickets"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Service Requests ({tickets.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("hardware")}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "hardware"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Hardware ({hardware.reduce((sum, h) => sum + h.quantity, 0)})
                    </button>
                    <button
                        onClick={() => setActiveTab("tasks")}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "tasks"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Tasks ({tasks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("documents")}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "documents"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Documents
                    </button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Company Details Tab */}
                    {activeTab === "details" && (
                        <Card>
                        <CardHeader>
                            <CardTitle>Company Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                                    <p className="mt-1">{customer.companyName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                                    <p className="mt-1">{customer.regNumber || "N/A"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">VAT Number</label>
                                    <p className="mt-1">{customer.vatNumber || "N/A"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Telephone</label>
                                    <p className="mt-1">{customer.telephone}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="mt-1">{customer.email || "N/A"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">City</label>
                                    <p className="mt-1">{customer.city || "N/A"}</p>
                                </div>
                            </div>
                            {customer.address && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                                    <p className="mt-1">{customer.address}</p>
                                </div>
                            )}
                            {customer.pbxLink && (
                                <div className="pt-4 border-t">
                                    <label className="text-sm font-medium text-muted-foreground">Cloud PBX System</label>
                                    <a 
                                        href={customer.pbxLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="mt-2 flex items-center gap-2 text-primary hover:underline"
                                    >
                                        <Phone className="h-4 w-4" />
                                        Access PBX System
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    )}

                    {/* Contacts Tab */}
                    {activeTab === "contacts" && (
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Contacts ({contacts.length})</CardTitle>
                            <Button size="sm" onClick={() => setShowContactModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Contact
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {contacts.length === 0 ? (
                                <div className="text-center py-8">
                                    <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground mb-4">No contacts added yet</p>
                                    <Button onClick={() => setShowContactModal(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add First Contact
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {contacts.map((contact: any, index: number) => (
                                        <div 
                                            key={index} 
                                            className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/dashboard/customers/${customerId}/contacts/${contact.id}`)}
                                        >
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {contact.firstName} {contact.lastName}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {contact.role || "No role specified"}
                                                </p>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                    {contact.email && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {contact.email}
                                                        </span>
                                                    )}
                                                    {contact.cellNumber && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {contact.cellNumber}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    )}

                    {/* Hardware Tab */}
                    {activeTab === "hardware" && (
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Hardware ({hardware.reduce((sum, h) => sum + h.quantity, 0)})</CardTitle>
                            <Button size="sm" onClick={() => setShowHardwareModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Hardware
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {hardware.length === 0 ? (
                                <div className="text-center py-8">
                                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground mb-4">No hardware added yet</p>
                                    <Button onClick={() => setShowHardwareModal(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add First Hardware
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {hardware.map((item: any) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Package className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.hardwareLabel}</p>
                                                    {item.nickname && (
                                                        <p className="text-xs text-muted-foreground italic">"{item.nickname}"</p>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-x-3 text-xs text-muted-foreground mt-1">
                                                        {item.serialNumber && (
                                                            <span>SN: {item.serialNumber}</span>
                                                        )}
                                                        {item.macAddress && (
                                                            <span>MAC: {item.macAddress}</span>
                                                        )}
                                                        {item.ipAddress && (
                                                            <span>IP: {item.ipAddress}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => {
                                                    setHardwareToDelete(item.id);
                                                    setShowDeleteConfirm(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    )}

                    {/* Service Requests Tab */}
                    {activeTab === "tickets" && (
                        <Card>
                        <CardHeader>
                            <CardTitle>Service Requests ({tickets.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {tickets.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No service requests yet
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tickets.slice(0, 10).map((ticket) => (
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
                                    {tickets.length > 10 && (
                                        <Button variant="outline" className="w-full">
                                            View All {tickets.length} Tickets
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    )}

                    {/* Tasks Tab */}
                    {activeTab === "tasks" && (
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Tasks ({tasks.length})</CardTitle>
                            <Button size="sm" onClick={() => setShowAddTaskModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Task
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {tasks.length === 0 ? (
                                <div className="text-center py-8">
                                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground mb-4">No tasks for this customer yet</p>
                                    <Button onClick={() => setShowAddTaskModal(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add First Task
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tasks.map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onComplete={handleCompleteTask}
                                            onUncomplete={handleUncompleteTask}
                                            onDelete={(id) => {
                                                setTaskToDelete(id);
                                                setShowDeleteTaskConfirm(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    )}
                </div>

                {/* Sidebar - Always Visible */}
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
                            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setShowAddTaskModal(true)}>
                                <CheckSquare className="h-4 w-4" />
                                Add Task
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setShowContactModal(true)}>
                                <Plus className="h-4 w-4" />
                                Add Contact
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setShowEditModal(true)}>
                                <Edit className="h-4 w-4" />
                                Edit Company
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div className="w-px flex-1 bg-border mt-2" style={{ minHeight: '20px' }} />
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <p className="font-medium">Company Created</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatTimestamp(customer.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                {tickets.length > 0 && (
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <Ticket className="h-4 w-4" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">First Ticket Created</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatTimestamp(tickets[tickets.length - 1]?.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Contact Modal */}
            <AddContactModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                onSuccess={handleContactSuccess}
                companyId={customerId}
                companyName={customer.companyName}
            />

            {/* Edit Company Modal */}
            <CustomerModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={() => {
                    customerService.getById(customerId).then(setCustomer);
                    setShowEditModal(false);
                }}
                company={customer}
            />

            {/* Create Ticket Modal */}
            <EnhancedTicketModal
                isOpen={showTicketModal}
                onClose={() => setShowTicketModal(false)}
                onSuccess={() => {
                    ticketService.getByCompanyId(customerId).then(setTickets);
                    setShowTicketModal(false);
                }}
                prefilledCompanyId={customerId}
                prefilledCompanyName={customer?.companyName}
                customerHardware={hardware}
            />

            {/* Add Hardware Modal */}
            <AddHardwareModal
                isOpen={showHardwareModal}
                onClose={() => setShowHardwareModal(false)}
                onSuccess={async () => {
                    const updatedHardware = await hardwareService.getByCustomerId(customerId);
                    setHardware(updatedHardware);
                    toast.success("Hardware added successfully!");
                    setShowHardwareModal(false);
                }}
                customerId={customerId}
                companyName={customer?.companyName || ""}
            />

            {/* Delete Hardware Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setHardwareToDelete(null);
                }}
                onConfirm={async () => {
                    if (hardwareToDelete) {
                        try {
                            await hardwareService.delete(hardwareToDelete);
                            const updatedHardware = await hardwareService.getByCustomerId(customerId);
                            setHardware(updatedHardware);
                            toast.success("Hardware deleted successfully");
                        } catch (error) {
                            console.error("Error deleting hardware:", error);
                            toast.error("Failed to delete hardware");
                        }
                        setHardwareToDelete(null);
                    }
                }}
                title="Delete Hardware"
                message="Are you sure you want to delete this hardware item? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Add Task Modal */}
            <AddTaskModal
                isOpen={showAddTaskModal}
                onClose={() => setShowAddTaskModal(false)}
                onSuccess={() => {
                    setShowAddTaskModal(false);
                    toast.success("Task created successfully!");
                }}
                prefilledCustomerId={customerId}
                prefilledCustomerName={customer?.companyName}
                source="customer"
            />

            {/* Delete Task Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteTaskConfirm}
                onClose={() => {
                    setShowDeleteTaskConfirm(false);
                    setTaskToDelete(null);
                }}
                onConfirm={handleDeleteTask}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}
