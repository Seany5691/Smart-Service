"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { customerService } from "@/lib/firebase/services";
import { toast } from "sonner";

interface AddContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    companyId: string;
    companyName: string;
}

export default function AddContactModal({ isOpen, onClose, onSuccess, companyId, companyName }: AddContactModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        cellNumber: "",
        role: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName) {
            toast.error("Name and Surname are required");
            return;
        }

        setLoading(true);

        try {
            // Get current company data
            const company: any = await customerService.getById(companyId);
            if (!company) {
                toast.error("Company not found");
                return;
            }

            // Add new contact to contacts array
            const updatedContacts = [
                ...(company.contacts || []),
                {
                    ...formData,
                    id: Date.now().toString(),
                }
            ];

            // Update company with new contact
            await customerService.update(companyId, {
                contacts: updatedContacts,
            });

            toast.success("Contact added successfully!");
            
            // Reset form
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                cellNumber: "",
                role: "",
            });

            onSuccess();
        } catch (error) {
            console.error("Error adding contact:", error);
            toast.error("Failed to add contact. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
                <div className="flex items-center justify-between border-b p-6">
                    <div>
                        <h2 className="text-2xl font-bold">Add Contact</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Adding contact for {companyName}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name *</label>
                            <Input
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="John"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Surname *</label>
                            <Input
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@company.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cell Number</label>
                            <Input
                                value={formData.cellNumber}
                                onChange={(e) => setFormData({ ...formData, cellNumber: e.target.value })}
                                placeholder="082 123 4567"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Role/Position</label>
                        <Input
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            placeholder="IT Manager"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Contact"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
