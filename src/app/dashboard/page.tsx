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
    CheckSquare,
} from "lucide-react";
import Link from "next/link";
import { ticketService, customerService } from "@/lib/firebase/services";
import { taskService, Task } from "@/lib/firebase/tasks";
import { format, formatDistanceToNow } from "date-fns";
import EnhancedTicketModal from "@/components/modals/EnhancedTicketModal";
import AddTaskModal from "@/components/modals/AddTaskModal";
import TaskCard from "@/components/TaskCard";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { LoadingState, SkeletonStats } from "@/components/LoadingState";

export default function DashboardPage() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTicketModal, setShowNewTicketModal] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

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
        const unsubscribeTickets = ticketService.subscribeToTickets((data) => {
            setTickets(data);
        });

        // Subscribe to tasks (with error handling)
        let unsubscribeTasks: (() => void) | undefined;
        if (user) {
            try {
                unsubscribeTasks = taskService.subscribeToUserTasks(user.uid, (data) => {
                    setTasks(data);
                });
            } catch (error) {
                console.error("Error subscribing to user tasks:", error);
                // Indexes might still be building
            }
        }

        return () => {
            unsubscribeTickets();
            if (unsubscribeTasks) {
                try {
                    unsubscribeTasks();
                } catch (error) {
                    console.error("Error unsubscribing from tasks:", error);
                }
            }
        };
    }, [user]);

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

    // My Open Tickets - filter by current user and non-resolved status
    const myOpenTickets = tickets
        .filter(t => {
            // Show tickets assigned to current user that are not resolved
            return user && t.assigneeId === user.uid && t.status !== "resolved";
        })
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
            setShowDeleteConfirm(false);
            setTaskToDelete(null);
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Failed to delete task");
        }
    };

    const incompleteTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    if (loading) {
        return (
            <div className="space-y-6">
                <Card className="shadow-lg border-0">
                    <CardContent className="p-8">
                        <div className="h-24 bg-accent rounded-xl animate-pulse" />
                    </CardContent>
                </Card>
                <SkeletonStats />
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="shadow-lg border-0">
                        <CardContent className="p-6 space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-20 bg-accent rounded-lg animate-pulse" />
                            ))}
                        </CardContent>
                    </Card>
                    <Card className="shadow-lg border-0">
                        <CardContent className="p-6 space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-20 bg-accent rounded-lg animate-pulse" />
                            ))}
                        </CardContent>
                    </Card>
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
                {/* My Open Tickets */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <CardTitle className="flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-blue-600" />
                            My Open Tickets
                        </CardTitle>
                        <Link href="/dashboard/tickets">
                            <Button variant="ghost" size="sm" className="gap-1">
                                View all
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-6">
                        {myOpenTickets.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <Ticket className="mx-auto h-12 w-12 mb-4 opacity-20" />
                                <p>No open tickets assigned to you.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myOpenTickets.map((ticket) => (
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

            {/* Tasks Card */}
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                    <CardTitle className="flex items-center gap-2">
                        <CheckSquare className="h-5 w-5 text-purple-600" />
                        My Tasks
                        {incompleteTasks.length > 0 && (
                            <Badge variant="secondary">{incompleteTasks.length}</Badge>
                        )}
                    </CardTitle>
                    <Button size="sm" onClick={() => setShowAddTaskModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                    </Button>
                </CardHeader>
                <CardContent className="p-6">
                    {tasks.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <CheckSquare className="mx-auto h-12 w-12 mb-4 opacity-20" />
                            <p className="mb-4">No tasks yet. Stay organized!</p>
                            <Button onClick={() => setShowAddTaskModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Task
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Incomplete Tasks */}
                            {incompleteTasks.length > 0 && (
                                <div className="space-y-3">
                                    {incompleteTasks.slice(0, 5).map((task) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onComplete={handleCompleteTask}
                                            onUncomplete={handleUncompleteTask}
                                            onDelete={(id) => {
                                                setTaskToDelete(id);
                                                setShowDeleteConfirm(true);
                                            }}
                                        />
                                    ))}
                                    {incompleteTasks.length > 5 && (
                                        <p className="text-sm text-muted-foreground text-center pt-2">
                                            + {incompleteTasks.length - 5} more tasks
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Completed Tasks */}
                            {completedTasks.length > 0 && (
                                <details className="group">
                                    <summary className="cursor-pointer list-none text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                                        <svg
                                            className="h-4 w-4 transition-transform group-open:rotate-90"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        Completed ({completedTasks.length})
                                    </summary>
                                    <div className="mt-3 space-y-3">
                                        {completedTasks.slice(0, 3).map((task) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                onComplete={handleCompleteTask}
                                                onUncomplete={handleUncompleteTask}
                                                onDelete={(id) => {
                                                    setTaskToDelete(id);
                                                    setShowDeleteConfirm(true);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </details>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* New Ticket Modal */}
            <EnhancedTicketModal
                isOpen={showNewTicketModal}
                onClose={() => setShowNewTicketModal(false)}
                onSuccess={() => setShowNewTicketModal(false)}
            />

            {/* Add Task Modal */}
            <AddTaskModal
                isOpen={showAddTaskModal}
                onClose={() => setShowAddTaskModal(false)}
                onSuccess={() => {
                    setShowAddTaskModal(false);
                }}
                source="dashboard"
            />

            {/* Delete Task Confirmation */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
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
