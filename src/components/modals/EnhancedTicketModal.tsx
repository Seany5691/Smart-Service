"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Check, ExternalLink } from "lucide-react";
import { ticketService, customerService } from "@/lib/firebase/services";
import { settingsService } from "@/lib/firebase/settings";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import MobileModal from "@/components/MobileModal";

interface EnhancedTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    prefilledCompanyId?: string;
    prefilledCompanyName?: string;
    prefilledContactId?: string;
    prefilledContactName?: string;
    prefilledContactEmail?: string;
    customerHardware?: any[];
}

export default function EnhancedTicketModal({ 
    isOpen, 
    onClose, 
    onSuccess,
    prefilledCompanyId,
    prefilledCompanyName,
    prefilledContactId,
    prefilledContactName,
    prefilledContactEmail,
    customerHardware = [],
}: EnhancedTicketModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCustomerList, setShowCustomerList] = useState(false);
    const [categories, setCategories] = useState<any>({});
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [loadedHardware, setLoadedHardware] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        companyId: "",
        companyName: "",
        contactId: "",
        contactName: "",
        contactEmail: "",
        category: "telephony",
        subcategory: "",
        priority: "medium",
        status: "open",
        assignee: "Unassigned",
        assigneeId: "unassigned",
        slaHours: "24",
    });

    // Load customers, categories, and technicians
    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                const [customersData, categoriesData, techniciansData] = await Promise.all([
                    customerService.getAll(),
                    settingsService.getCategories(),
                    settingsService.getTechnicians(),
                ]);
                
                setCustomers(customersData);
                setCategories(categoriesData);
                setTechnicians(techniciansData);
            };
            loadData();

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
                
                // Load customer data for PBX link
                customerService.getById(prefilledCompanyId).then(setSelectedCustomer);
            }
        }
    }, [isOpen, prefilledCompanyId, prefilledCompanyName, prefilledContactId, prefilledContactName, prefilledContactEmail]);

    const filteredCustomers = customers.filter(c =>
        c.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedCompany = customers.find(c => c.id === formData.companyId);
    const companyContacts = selectedCompany?.contacts || [];
    const subcategories = categories[formData.category]?.subcategories || [];

    const handleSelectCompany = async (company: any) => {
        setFormData({
            ...formData,
            companyId: company.id,
            companyName: company.companyName,
            contactId: "",
            contactName: "",
            contactEmail: "",
        });
        setSearchQuery(company.companyName);
        setShowCustomerList(false);
        setSelectedCustomer(company);
        
        // Load hardware for this customer if not already provided
        if (customerHardware.length === 0) {
            try {
                const { hardwareService } = await import("@/lib/firebase/hardware");
                const hardware = await hardwareService.getByCustomerId(company.id);
                setLoadedHardware(hardware);
            } catch (error) {
                console.error("Error loading hardware:", error);
                setLoadedHardware([]);
            }
        }
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

    const handleCategoryChange = (category: string) => {
        setFormData({
            ...formData,
            category,
            subcategory: "", // Reset subcategory when category changes
        });
    };

    const handlePriorityChange = (priority: string) => {
        // Auto-set SLA based on priority
        const slaMap: any = {
            critical: "2",
            high: "8",
            medium: "24",
            low: "48",
        };
        setFormData({
            ...formData,
            priority,
            slaHours: slaMap[priority] || "24",
        });
    };

    const handleAssigneeChange = (assigneeId: string) => {
        const tech = technicians.find(t => t.id === assigneeId);
        setFormData({
            ...formData,
            assigneeId,
            assignee: tech?.name || "Unassigned",
        });
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

        if (!formData.subcategory) {
            toast.error("Please select a subcategory");
            return;
        }

        setLoading(true);

        try {
            // Generate ticket ID
            const categoryPrefix: any = {
                telephony: "TEL",
                copiers: "COP",
                cctv: "CCTV",
                internet: "INT",
                office: "OFF",
            };

            const ticketNumber = `${categoryPrefix[formData.category] || "TKT"}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;

            // Calculate SLA deadline
            const slaDeadline = new Date();
            slaDeadline.setHours(slaDeadline.getHours() + parseInt(formData.slaHours));

            // Prepare hardware summary for ticket (use whichever is available)
            const hardwareToSave = customerHardware.length > 0 ? customerHardware : loadedHardware;
            const hardwareSummary = hardwareToSave.map((item: any) => ({
                label: item.hardwareLabel,
                nickname: item.nickname || null,
                quantity: item.quantity,
                serialNumber: item.serialNumber || null,
                macAddress: item.macAddress || null,
                ipAddress: item.ipAddress || null,
            }));

            const ticketData = {
                ...formData,
                ticketId: ticketNumber,
                createdBy: user?.email || "System",
                customer: formData.companyName,
                slaDeadline: slaDeadline.toISOString(),
                pbxLink: selectedCustomer?.pbxLink || null,
                hardware: hardwareSummary.length > 0 ? hardwareSummary : null,
                progressStatus: 'Not Started',
                isClosed: false,
                closedAt: null,
                closedBy: null,
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
                subcategory: "",
                priority: "medium",
                status: "open",
                assignee: "Unassigned",
                assigneeId: "unassigned",
                slaHours: "24",
            });
            setSearchQuery("");
            setSelectedCustomer(null);
        } catch (error) {
            console.error("Error creating ticket:", error);
            toast.error("Failed to create ticket. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <MobileModal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Ticket"
            size="xl"
            footer={
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 sm:flex-none h-12 lg:h-10"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="ticket-form"
                        disabled={loading}
                        className="flex-1 sm:flex-none h-12 lg:h-10"
                    >
                        {loading ? "Creating..." : "Create Ticket"}
                    </Button>
                </div>
            }
        >
            <form id="ticket-form" onSubmit={handleSubmit} className="space-y-6">
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
                                        setFormData({ ...formData, companyId: "", contactId: "" });
                                    }
                                }}
                                onFocus={() => setShowCustomerList(true)}
                                placeholder="Search for a company..."
                                className="pl-9 h-12 lg:h-10 text-base lg:text-sm"
                                disabled={!!prefilledCompanyId}
                            />
                        </div>

                        {/* Dropdown List */}
                        {showCustomerList && searchQuery && !prefilledCompanyId && (
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

                    {/* PBX Link Display */}
                    {selectedCustomer?.pbxLink && (
                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Cloud PBX System Available</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        This customer has a PBX system configured
                                    </p>
                                </div>
                                <a
                                    href={selectedCustomer.pbxLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                    Access PBX
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Hardware Display */}
                    {(customerHardware.length > 0 || loadedHardware.length > 0) && (
                        <div className="p-3 bg-accent/50 border rounded-lg">
                            <p className="text-sm font-medium mb-2">Customer Hardware</p>
                            <div className="grid grid-cols-2 gap-2">
                                {(customerHardware.length > 0 ? customerHardware : loadedHardware).map((item: any) => (
                                    <div key={item.id} className="text-xs p-2 bg-card rounded border">
                                        <p className="font-medium">{item.hardwareLabel}</p>
                                        {item.nickname && <p className="text-muted-foreground italic">"{item.nickname}"</p>}
                                        {item.serialNumber && <p className="text-muted-foreground">SN: {item.serialNumber}</p>}
                                        {item.macAddress && <p className="text-muted-foreground">MAC: {item.macAddress}</p>}
                                        {item.ipAddress && <p className="text-muted-foreground">IP: {item.ipAddress}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contact Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Person *</label>
                        <select
                            required
                            disabled={!formData.companyId || !!prefilledContactId}
                            value={formData.contactId}
                            onChange={(e) => handleSelectContact(e.target.value)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring disabled:opacity-50"
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
                                This company has no contacts. Please add a contact first.
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
                            className="h-12 lg:h-10 text-base lg:text-sm"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description *</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring"
                            placeholder="Detailed description of the issue"
                        />
                    </div>

                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category *</label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring"
                            >
                                <option value="telephony">Telephony</option>
                                <option value="copiers">Copiers</option>
                                <option value="cctv">CCTV</option>
                                <option value="internet">Internet</option>
                                <option value="office">Office Automation</option>
                            </select>
                        </div>

                        {/* Subcategory */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subcategory *</label>
                            <select
                                required
                                value={formData.subcategory}
                                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring"
                            >
                                <option value="">Select subcategory...</option>
                                {subcategories.map((sub: string) => (
                                    <option key={sub} value={sub}>
                                        {sub}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                        {/* Priority */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Priority *</label>
                            <select
                                required
                                value={formData.priority}
                                onChange={(e) => handlePriorityChange(e.target.value)}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        {/* SLA */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">SLA (Hours) *</label>
                            <select
                                required
                                value={formData.slaHours}
                                onChange={(e) => setFormData({ ...formData, slaHours: e.target.value })}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring"
                            >
                                <option value="2">2 Hours</option>
                                <option value="4">4 Hours</option>
                                <option value="8">8 Hours</option>
                                <option value="12">12 Hours</option>
                                <option value="24">24 Hours</option>
                                <option value="48">48 Hours</option>
                                <option value="72">72 Hours</option>
                            </select>
                        </div>

                        {/* Assignee */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assign To *</label>
                            <select
                                required
                                value={formData.assigneeId}
                                onChange={(e) => handleAssigneeChange(e.target.value)}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring"
                            >
                                {technicians.map((tech) => (
                                    <option key={tech.id} value={tech.id}>
                                        {tech.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </form>
            </MobileModal>
    );
}
