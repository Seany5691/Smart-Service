"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, Check, User } from "lucide-react";
import { ticketService, customerService } from "@/lib/firebase/services";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NewTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    prefilledCompanyId?: string;
    prefilledCompanyName?: string;
    prefilledContactId?: string;
    prefilledContactName?: string;
    prefilledContactEmail?: string;
}

export default function NewTicketModal({ 
    isOpen, 
    onClose, 
    onSuccess,
    prefilledCompanyId,
    prefilledCompanyName,
    prefilledContactId,
    prefilledContactName,
    prefilledContactEmail,
}: NewTicketModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCustomerList, setShowCustomerList] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        companyId: "",
        companyName: "",
        contactId: "",
        contactName: "",
        contactEmail: "",
        category: "telephony",
        priority: "medium",
        status: "open",
    });

    // Load customers on mount and handle prefilled data
    useEffect(() => {
        if (isOpen) {
            const loadCustomers = async () => {
                const data = await customerService.getAll();
                setCustomers(data);
            };
            loadCustomers();

            // Set prefilled data if provided
            if (prefilledCompanyId && prefilledCompanyName) {
                setFormData(prev => ({
                    ...prev,
                    companyId: prefilledCompanyId,
                    companyName: prefilledCompanyName,
                    contactId: prefilledContactId || "",
                    contactName: prefilledContactName || "",
                    contactEmail: prefilledContactEmail || "",
                }));
                setSearchQuery(prefilledCompanyName);
            }
        }
    }, [isOpen, prefilledCompanyId, prefilledCompanyName, prefilledContactId, prefilledContactName, prefilledContactEmail]);

    const filteredCustomers = customers.filter(c =>
        c.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedCompany = customers.find(c => c.id === formData.companyId);
    const companyContacts = selectedCompany?.contacts || [];

    const handleSelectCompany = (company: any) => {
        setFormData({
            ...formData,
            companyId: company.id,
            companyName: company.companyName,
            contactId: "", // Reset contact
            contactName: "",
            contactEmail: "",
        });
        setSearchQuery(company.companyName);
        setShowCustomerList(false);
    };

    const handleSelectContact = (contactId: string) => {
        const contact = companyContacts.find((c: any) => c.id === contactId);
        if (contact) {
            setFormData({
                ...formData,
                contactId: contact.id,
                contactName: `${contact.firstName} ${contact.lastName}`,
                contactEmail: contact.email,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.companyId) {
            toast.error("Please select a valid company");
            return;
        }

        if (!formData.contactId) {
            toast.error("Please select a contact person");
            return;
        }

        setLoading(true);

        try {
            // Generate ticket ID
            const categoryPrefix = {
                telephony: "TEL",
                copiers: "COP",
                cctv: "CCTV",
                internet: "INT",
                office: "OFF",
            }[formData.category] || "TKT";

            const ticketNumber = `${categoryPrefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;

            const ticketData = {
                ...formData,
                ticketId: ticketNumber,
                assignee: "Unassigned",
                createdBy: user?.email || "System",
                customer: formData.companyName, // Backward compatibility
            };

            await ticketService.create(ticketData, {
                uid: user?.uid || 'system',
                email: user?.email || '',
                name: user?.displayName || user?.email || 'System',
            });

            // Update customer open ticket count
            if (selectedCompany) {
                await customerService.update(selectedCompany.id, {
                    openTickets: (selectedCompany.openTickets || 0) + 1
                });
            }

            toast.success("Ticket created successfully!");
            onSuccess();
            onClose();

            // Reset form
            setFormData({
                title: "",
                description: "",
                companyId: "",
                companyName: "",
                contactId: "",
                contactName: "",
                contactEmail: "",
                category: "telephony",
                priority: "medium",
                status: "open",
            });
            setSearchQuery("");
        } catch (error) {
            console.error("Error creating ticket:", error);
            toast.error("Failed to create ticket. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
                <div className="flex items-center justify-between border-b p-6">
                    <h2 className="text-2xl font-bold">Create New Ticket</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Company Selection */}
                    <div className="space-y-2 relative">
                        <label className="text-sm font-medium">Company *</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                required
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowCustomerList(true);
                                    if (formData.companyId && e.target.value !== formData.companyName) {
                                        setFormData({ ...formData, companyId: "", contactId: "" }); // Reset if typing new search
                                    }
                                }}
                                onFocus={() => setShowCustomerList(true)}
                                placeholder="Search for a company..."
                                className="pl-9"
                            />
                        </div>

                        {/* Dropdown List */}
                        {showCustomerList && searchQuery && (
                            <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                                {filteredCustomers.length === 0 ? (
                                    <div className="p-3 text-sm text-muted-foreground text-center">
                                        No companies found. Please create the customer first.
                                    </div>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <button
                                            key={customer.id}
                                            type="button"
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center justify-between"
                                            onClick={() => handleSelectCompany(customer)}
                                        >
                                            <span>{customer.companyName}</span>
                                            {formData.companyId === customer.id && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Contact Selection (Dependent) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Person *</label>
                        <select
                            required
                            disabled={!formData.companyId}
                            value={formData.contactId}
                            onChange={(e) => handleSelectContact(e.target.value)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-ring disabled:opacity-50"
                        >
                            <option value="">Select a contact...</option>
                            {companyContacts.map((contact: any) => (
                                <option key={contact.id} value={contact.id}>
                                    {contact.firstName} {contact.lastName} ({contact.role})
                                </option>
                            ))}
                        </select>
                        {formData.companyId && companyContacts.length === 0 && (
                            <p className="text-xs text-destructive">
                                This company has no contacts. Please add a contact in the Customers page first.
                            </p>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title *</label>
                        <Input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Brief description of the issue"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description *</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-ring"
                            placeholder="Detailed description of the issue"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Category */}
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

                        {/* Priority */}
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
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Ticket"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
