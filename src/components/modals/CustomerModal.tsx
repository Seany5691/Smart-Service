"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customerService } from "@/lib/firebase/services";
import { toast } from "sonner";
import MobileModal from "@/components/MobileModal";

interface CompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (companyId?: string) => void;
    company?: any;
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
        <MobileModal
            isOpen={isOpen}
            onClose={onClose}
            title={company ? "Edit Company" : "New Company"}
            size="lg"
            footer={
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="h-12 lg:h-10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="h-12 lg:h-10"
                    >
                        {loading ? "Saving..." : company ? "Save Changes" : "Create Company"}
                    </Button>
                </div>
            }
        >
            <form id="company-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Company Name *</label>
                                    <Input
                                        required
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        placeholder="ABC Corporation"
                                        className="h-12 lg:h-10 text-base lg:text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Telephone *</label>
                                    <Input
                                        required
                                        type="tel"
                                        value={formData.telephone}
                                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                        placeholder="+27 11 123 4567"
                                        className="h-12 lg:h-10 text-base lg:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Company Reg Number</label>
                                    <Input
                                        value={formData.regNumber}
                                        onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                                        placeholder="2023/123456/07"
                                        className="h-12 lg:h-10 text-base lg:text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">VAT Number</label>
                                    <Input
                                        value={formData.vatNumber}
                                        onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                                        placeholder="4123456789"
                                        className="h-12 lg:h-10 text-base lg:text-sm"
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
                                    className="h-12 lg:h-10 text-base lg:text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cloud PBX Link (Optional)</label>
                                <Input
                                    type="url"
                                    value={formData.pbxLink}
                                    onChange={(e) => setFormData({ ...formData, pbxLink: e.target.value })}
                                    placeholder="https://pbx.example.com"
                                    className="h-12 lg:h-10 text-base lg:text-sm"
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
                                    className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring"
                                    placeholder="123 Business Street, Office Park..."
                                />
                            </div>

                            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">City</label>
                                    <Input
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Johannesburg"
                                        className="h-12 lg:h-10 text-base lg:text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Postal Code</label>
                                    <Input
                                        value={formData.postalCode}
                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                        placeholder="2000"
                                        className="h-12 lg:h-10 text-base lg:text-sm"
                                    />
                                </div>
                            </div>
                        </form>
        </MobileModal>
    );
}
