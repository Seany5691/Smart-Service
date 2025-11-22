"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customerService } from "@/lib/firebase/services";
import { toast } from "sonner";
import MobileModal from "@/components/MobileModal";

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
        <MobileModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Add Contact - ${companyName}`}
            size="md"
            footer={
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="h-12 lg:h-10"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="contact-form"
                        disabled={loading}
                        className="h-12 lg:h-10"
                    >
                        {loading ? "Adding..." : "Add Contact"}
                    </Button>
                </div>
            }
        >
            <form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name *</label>
                            <Input
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="John"
                                className="h-12 lg:h-10 text-base lg:text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Surname *</label>
                            <Input
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Doe"
                                className="h-12 lg:h-10 text-base lg:text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@company.com"
                                className="h-12 lg:h-10 text-base lg:text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cell Number</label>
                            <Input
                                type="tel"
                                value={formData.cellNumber}
                                onChange={(e) => setFormData({ ...formData, cellNumber: e.target.value })}
                                placeholder="082 123 4567"
                                className="h-12 lg:h-10 text-base lg:text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Role/Position</label>
                        <Input
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            placeholder="IT Manager"
                            className="h-12 lg:h-10 text-base lg:text-sm"
                        />
                    </div>
                </form>
        </MobileModal>
    );
}
