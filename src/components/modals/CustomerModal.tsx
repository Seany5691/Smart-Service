"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Trash2, User } from "lucide-react";
import { customerService } from "@/lib/firebase/services";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import CompanyTickets from "@/components/customers/CompanyTickets";

interface CompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (companyId?: string) => void;
    company?: any;
}

interface Contact {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    cellNumber: string;
    role: string;
}

export default function CompanyModal({ isOpen, onClose, onSuccess, company }: CompanyModalProps) {
    const [loading, setLoading] = useState(false);

    // Company Details
    const [formData, setFormData] = useState({
        companyName: "",
        regNumber: "",
        vatNumber: "",
        telephone: "",
        email: "",
        address: "",
        city: "",
        postalCode: "",
        pbxLink: "",
    });

    useEffect(() => {
        if (company) {
            setFormData({
                companyName: company.companyName || "",
                regNumber: company.regNumber || "",
                vatNumber: company.vatNumber || "",
                telephone: company.telephone || "",
                email: company.email || "",
                address: company.address || "",
                city: company.city || "",
                postalCode: company.postalCode || "",
                pbxLink: company.pbxLink || "",
            });
        } else {
            // Reset form for new company
            setFormData({
                companyName: "",
                regNumber: "",
                vatNumber: "",
                telephone: "",
                email: "",
                address: "",
                city: "",
                postalCode: "",
                pbxLink: "",
            });
        }
    }, [company, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const companyData = {
                ...formData,
                contacts: company?.contacts || [],
                name: formData.companyName, // For backward compatibility/search
                updatedAt: new Date().toISOString(),
            };

            if (company) {
                await customerService.update(company.id, companyData);
                toast.success("Company updated successfully!");
                onSuccess();
                onClose();
            } else {
                const newCompanyId = await customerService.create({
                    ...companyData,
                    createdAt: new Date().toISOString(),
                    sites: 0,
                    activeContracts: 0,
                    openTickets: 0,
                    status: "active",
                });
                toast.success("Company created successfully!");
                onClose();
                // Trigger contact modal with the new company ID
                onSuccess(newCompanyId);
            }
        } catch (error) {
            console.error("Error saving company:", error);
            toast.error("Failed to save company. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                <div className="flex items-center justify-between border-b p-6">
                    <h2 className="text-2xl font-bold">{company ? "Edit Company" : "New Company"}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6">(
                        <form id="company-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Company Name *</label>
                                    <Input
                                        required
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        placeholder="ABC Corporation"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Telephone *</label>
                                    <Input
                                        required
                                        value={formData.telephone}
                                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                        placeholder="+27 11 123 4567"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Company Reg Number</label>
                                    <Input
                                        value={formData.regNumber}
                                        onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                                        placeholder="2023/123456/07"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">VAT Number</label>
                                    <Input
                                        value={formData.vatNumber}
                                        onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                                        placeholder="4123456789"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="info@company.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cloud PBX Link (Optional)</label>
                                <Input
                                    type="url"
                                    value={formData.pbxLink}
                                    onChange={(e) => setFormData({ ...formData, pbxLink: e.target.value })}
                                    placeholder="https://pbx.example.com"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Link to cloud PBX system (for telephony customers)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Physical Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-ring"
                                    placeholder="123 Business Street, Office Park..."
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">City</label>
                                    <Input
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Johannesburg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Postal Code</label>
                                    <Input
                                        value={formData.postalCode}
                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                        placeholder="2000"
                                    />
                                </div>
                            </div>
                        </form>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t bg-muted/20">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Saving..." : company ? "Save Changes" : "Create Company"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
