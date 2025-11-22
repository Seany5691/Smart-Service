"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Building2, MapPin, Phone, Mail, MoreVertical, Ticket, FileText } from "lucide-react";
import { customerService } from "@/lib/firebase/services";
import { toast } from "sonner";
import CustomerModal from "@/components/modals/CustomerModal";
import AddContactModal from "@/components/modals/AddContactModal";
import { useRouter } from "next/navigation";

export default function CustomersPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [showContactModal, setShowContactModal] = useState(false);
    const [newCompanyId, setNewCompanyId] = useState<string | null>(null);
    const [newCompanyName, setNewCompanyName] = useState<string>("");

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const data = await customerService.getAll();
            setCustomers(data);
        } catch (error) {
            console.error("Error loading customers:", error);
            toast.error("Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const filteredCustomers = customers.filter((customer) =>
        customer.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleView = (customer: any) => {
        router.push(`/dashboard/customers/${customer.id}`);
    };

    const handleNew = () => {
        setSelectedCustomer(null);
        setShowModal(true);
    };

    const handleCompanySuccess = async (companyId?: string) => {
        await loadCustomers();
        
        if (companyId) {
            // New company created, show contact modal
            const company: any = await customerService.getById(companyId);
            if (company) {
                setNewCompanyId(companyId);
                setNewCompanyName(company.companyName || "");
                setShowContactModal(true);
            }
        }
    };

    const handleContactSuccess = () => {
        loadCustomers();
        
        // Ask if they want to add another contact
        const addAnother = window.confirm("Contact added successfully! Add another contact?");
        
        if (!addAnother) {
            setShowContactModal(false);
            setNewCompanyId(null);
            setNewCompanyName("");
        }
        // If yes, modal stays open and form is reset
    };

    return (
        <div className="space-y-6">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Customers</h1>
                        <p className="mt-2 text-emerald-100">
                            Manage your customer database and contracts • {customers.length} total
                        </p>
                    </div>
                    <Button 
                        size="lg"
                        className="gap-2 bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg" 
                        onClick={handleNew}
                    >
                        <Plus className="h-5 w-5" />
                        New Customer
                    </Button>
                </div>
            </div>

            {/* Search Card */}
            <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by company name, email, or city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 border-0 bg-accent/50 focus-visible:ring-2"
                        />
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">Loading customers...</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Stats Grid with Gradients */}
                    <div className="grid gap-6 md:grid-cols-4">
                        <Card className="relative overflow-hidden border-0 shadow-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-5"></div>
                            <CardContent className="relative p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                                        <div className="text-4xl font-bold mt-2">{customers.length}</div>
                                    </div>
                                    <div className="rounded-2xl p-4 bg-emerald-500/10">
                                        <Building2 className="h-8 w-8 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden border-0 shadow-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-5"></div>
                            <CardContent className="relative p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Sites</p>
                                        <div className="text-4xl font-bold mt-2">
                                            {customers.reduce((sum, c) => sum + (c.sites || 0), 0)}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl p-4 bg-blue-500/10">
                                        <MapPin className="h-8 w-8 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden border-0 shadow-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-5"></div>
                            <CardContent className="relative p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Active Contracts</p>
                                        <div className="text-4xl font-bold mt-2">
                                            {customers.reduce((sum, c) => sum + (c.activeContracts || 0), 0)}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl p-4 bg-purple-500/10">
                                        <FileText className="h-8 w-8 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="relative overflow-hidden border-0 shadow-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-5"></div>
                            <CardContent className="relative p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Open Tickets</p>
                                        <div className="text-4xl font-bold mt-2">
                                            {customers.reduce((sum, c) => sum + (c.openTickets || 0), 0)}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl p-4 bg-amber-500/10">
                                        <Ticket className="h-8 w-8 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCustomers.map((customer) => (
                            <Card
                                key={customer.id}
                                className="group cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.02] border-0 shadow-lg overflow-hidden"
                                onClick={() => handleView(customer)}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                <CardHeader className="pb-3 relative">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg group-hover:scale-110 transition-transform">
                                                <Building2 className="h-7 w-7 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                                                    {customer.companyName || customer.name}
                                                </CardTitle>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {customer.regNumber || 'No reg number'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 relative">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="h-4 w-4 text-emerald-600" />
                                            <span className="truncate">{customer.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="h-4 w-4 text-emerald-600" />
                                            <span>{customer.telephone || customer.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-4 w-4 text-emerald-600" />
                                            <span>{customer.city}</span>
                                        </div>
                                    </div>
                                    {(customer.openTickets > 0 || customer.sites > 0) && (
                                        <div className="flex gap-2 pt-3 border-t">
                                            {customer.openTickets > 0 && (
                                                <div className="flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">
                                                    <Ticket className="h-3 w-3" />
                                                    <span>{customer.openTickets} open</span>
                                                </div>
                                            )}
                                            {customer.sites > 0 && (
                                                <div className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{customer.sites} sites</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredCustomers.length === 0 && (
                        <Card className="shadow-lg border-0">
                            <CardContent className="p-16 text-center">
                                <Building2 className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    {searchQuery ? "Try adjusting your search" : "Create your first customer to get started"}
                                </p>
                                {!searchQuery && (
                                    <Button onClick={handleNew} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        New Customer
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            <CustomerModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={handleCompanySuccess}
                company={selectedCustomer}
            />

            {newCompanyId && (
                <AddContactModal
                    isOpen={showContactModal}
                    onClose={() => {
                        setShowContactModal(false);
                        setNewCompanyId(null);
                        setNewCompanyName("");
                    }}
                    onSuccess={handleContactSuccess}
                    companyId={newCompanyId}
                    companyName={newCompanyName}
                />
            )}
        </div>
    );
}
