"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { ticketService } from "@/lib/firebase/services";
import { toast } from "sonner";

interface EditTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    ticket: any;
}

export default function EditTicketModal({ isOpen, onClose, onSuccess, ticket }: EditTicketModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: ticket?.title || "",
        description: ticket?.description || "",
        customer: ticket?.customer || "",
        category: ticket?.category || "telephony",
        priority: ticket?.priority || "medium",
        status: ticket?.status || "open",
        assignee: ticket?.assignee || "Unassigned",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await ticketService.update(ticket.id, formData);
            toast.success("Ticket updated successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating ticket:", error);
            toast.error("Failed to update ticket. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this ticket?")) return;

        setLoading(true);
        try {
            await ticketService.delete(ticket.id);
            toast.success("Ticket deleted successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error deleting ticket:", error);
            toast.error("Failed to delete ticket.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
                <div className="flex items-center justify-between border-b p-6">
                    <h2 className="text-2xl font-bold">Edit Ticket</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title *</label>
                        <Input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description *</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-ring"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Customer *</label>
                            <Input
                                required
                                value={formData.customer}
                                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assignee</label>
                            <Input
                                value={formData.assignee}
                                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category *</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-ring"
                            >
                                <option value="telephony">Telephony</option>
                                <option value="copiers">Copiers</option>
                                <option value="cctv">CCTV</option>
                                <option value="internet">Internet</option>
                                <option value="office">Office Automation</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Priority *</label>
                            <select
                                required
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-ring"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status *</label>
                            <select
                                required
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-ring"
                            >
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="pending">Pending</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            Delete Ticket
                        </Button>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
