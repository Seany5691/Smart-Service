"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { taskService } from "@/lib/firebase/tasks";
import { customerService, ticketService } from "@/lib/firebase/services";
import { userService } from "@/lib/firebase/users";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import MobileModal from "@/components/MobileModal";

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    prefilledCustomerId?: string;
    prefilledCustomerName?: string;
    prefilledTicketId?: string;
    prefilledTicketNumber?: string;
    prefilledDescription?: string;
    source: 'dashboard' | 'ticket' | 'customer' | 'note_pin';
    allowAssignment?: boolean;
}

export default function AddTaskModal({
    isOpen,
    onClose,
    onSuccess,
    prefilledCustomerId,
    prefilledCustomerName,
    prefilledTicketId,
    prefilledTicketNumber,
    prefilledDescription,
    source,
    allowAssignment = false,
}: AddTaskModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    
    const [description, setDescription] = useState(prefilledDescription || "");
    const [customerId, setCustomerId] = useState(prefilledCustomerId || "");
    const [customerName, setCustomerName] = useState(prefilledCustomerName || "");
    const [ticketId, setTicketId] = useState(prefilledTicketId || "");
    const [ticketNumber, setTicketNumber] = useState(prefilledTicketNumber || "");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [assignedUserId, setAssignedUserId] = useState("");

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    useEffect(() => {
        // Load tickets when customer changes
        if (customerId && !prefilledTicketId) {
            loadTicketsForCustomer(customerId);
        }
    }, [customerId]);

    const loadData = async () => {
        try {
            const [customersData, usersData] = await Promise.all([
                customerService.getAll(),
                userService.getAllUsers(),
            ]);
            setCustomers(customersData);
            setUsers(usersData.filter((u: any) => u.id !== user?.uid)); // Exclude current user
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    const loadTicketsForCustomer = async (custId: string) => {
        try {
            const ticketsData = await ticketService.getByCompanyId(custId);
            setTickets(ticketsData.filter((t: any) => !t.isClosed)); // Only show open tickets
        } catch (error) {
            console.error("Error loading tickets:", error);
            setTickets([]);
        }
    };

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        setCustomerId(selectedId);
        
        if (selectedId) {
            const customer = customers.find(c => c.id === selectedId);
            setCustomerName(customer?.companyName || "");
        } else {
            setCustomerName("");
            setTicketId("");
            setTicketNumber("");
            setTickets([]);
        }
    };

    const handleTicketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        setTicketId(selectedId);
        
        if (selectedId) {
            const ticket = tickets.find(t => t.id === selectedId);
            setTicketNumber(ticket?.ticketId || "");
        } else {
            setTicketNumber("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!description.trim()) {
            toast.error("Please enter a task description");
            return;
        }

        if (!user) {
            toast.error("You must be logged in to create tasks");
            return;
        }

        setLoading(true);
        try {
            const taskData: any = {
                description: description.trim(),
                createdBy: user.uid,
                createdByName: user.displayName || user.email || "Unknown",
                createdByEmail: user.email || "",
                completed: false,
                source,
            };

            // Only add optional fields if they have values
            if (customerId) {
                taskData.customerId = customerId;
                taskData.customerName = customerName;
            }
            if (ticketId) {
                taskData.ticketId = ticketId;
                taskData.ticketNumber = ticketNumber;
            }
            if (dueDate) taskData.dueDate = dueDate;
            if (dueTime) taskData.dueTime = dueTime;
            if (assignedUserId) {
                taskData.assignedTo = [user.uid, assignedUserId];
            }

            // Get assigned user name if task is assigned
            let assignedUserName: string | undefined;
            if (assignedUserId) {
                const assignedUser = users.find((u: any) => u.id === assignedUserId);
                assignedUserName = assignedUser?.displayName || assignedUser?.email;
            }

            await taskService.create(taskData, user, assignedUserName);
            toast.success("Task created successfully!");
            onSuccess();
            handleClose();
        } catch (error) {
            console.error("Error creating task:", error);
            toast.error("Failed to create task");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setDescription(prefilledDescription || "");
        setCustomerId(prefilledCustomerId || "");
        setCustomerName(prefilledCustomerName || "");
        setTicketId(prefilledTicketId || "");
        setTicketNumber(prefilledTicketNumber || "");
        setDueDate("");
        setDueTime("");
        setAssignedUserId("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <MobileModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add Task"
            size="md"
            footer={
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                    <Button 
                        type="button"
                        variant="outline" 
                        onClick={handleClose}
                        disabled={loading}
                        className="h-12 lg:h-10"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="task-form"
                        disabled={loading}
                        className="h-12 lg:h-10"
                    >
                        {loading ? "Creating..." : "Create Task"}
                    </Button>
                </div>
            }
        >
            <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Task Description *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter task description..."
                            className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring"
                            required
                        />
                    </div>

                    {/* Customer Selection */}
                    {!prefilledCustomerId && !prefilledTicketId && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Link to Customer (Optional)
                            </label>
                            <select
                                value={customerId}
                                onChange={handleCustomerChange}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring"
                            >
                                <option value="">No customer</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.companyName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Ticket Selection */}
                    {!prefilledTicketId && customerId && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Link to Ticket (Optional)
                            </label>
                            <select
                                value={ticketId}
                                onChange={handleTicketChange}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring"
                            >
                                <option value="">No ticket</option>
                                {tickets.map((ticket) => (
                                    <option key={ticket.id} value={ticket.id}>
                                        {ticket.ticketId} - {ticket.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Due Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Due Date (Optional)
                        </label>
                        <Input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="h-12 lg:h-10 text-base lg:text-sm"
                        />
                    </div>

                    {/* Due Time */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Due Time (Optional)
                        </label>
                        <Input
                            type="time"
                            value={dueTime}
                            onChange={(e) => setDueTime(e.target.value)}
                            className="h-12 lg:h-10 text-base lg:text-sm"
                        />
                    </div>

                    {/* User Assignment (only for ticket tasks) */}
                    {allowAssignment && users.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Assign to User (Optional)
                            </label>
                            <select
                                value={assignedUserId}
                                onChange={(e) => setAssignedUserId(e.target.value)}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring"
                            >
                                <option key="only-me" value="">Only me</option>
                                {users.map((u: any) => (
                                    <option key={u.id} value={u.id}>
                                        {u.displayName || u.email}
                                    </option>
                                ))}
                            </select>
                            {assignedUserId && (
                                <p className="text-xs text-muted-foreground">
                                    Task will be visible to you and the assigned user
                                </p>
                            )}
                        </div>
                    )}
                </form>
        </MobileModal>
    );
}
