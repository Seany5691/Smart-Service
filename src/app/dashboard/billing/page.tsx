"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DollarSign,
    CreditCard,
    Download,
    FileText,
    TrendingUp,
    Calendar,
    Plus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { invoiceService } from "@/lib/firebase/services";
import { generatePDF } from "@/lib/utils/pdf";
import InvoicePrintTemplate from "@/components/InvoicePrintTemplate";
import AddInvoiceModal from "@/components/modals/AddInvoiceModal";
import { toast } from "sonner";

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface Invoice {
    id?: string;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    amount: number;
    issueDate: string;
    dueDate: string;
    status: string;
    items: InvoiceItem[];
    notes?: string;
}

export default function BillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [monthlyRevenue, setMonthlyRevenue] = useState(0);
    const [outstandingAmount, setOutstandingAmount] = useState(0);
    const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const data = await invoiceService.getAll();
            setInvoices(data as Invoice[]);

            // Get current month revenue
            const now = new Date();
            const revenue = await invoiceService.getMonthlyRevenue(now.getFullYear(), now.getMonth() + 1);
            setMonthlyRevenue(revenue);

            // Get outstanding amount
            const outstanding = await invoiceService.getOutstandingAmount();
            setOutstandingAmount(outstanding);
        } catch (error) {
            console.error("Error loading invoices:", error);
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, []);

    const handleDownloadInvoice = (invoice: Invoice) => {
        setInvoiceToPrint(invoice);
        // Small delay to ensure the component renders before printing
        setTimeout(() => {
            generatePDF(invoice.invoiceNumber);
            // Clear the invoice after printing
            setTimeout(() => {
                setInvoiceToPrint(null);
            }, 500);
        }, 100);
    };

    const handleInvoiceCreated = () => {
        loadInvoices();
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading billing data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Print Template - Hidden on screen, visible when printing */}
            {invoiceToPrint && <InvoicePrintTemplate invoice={invoiceToPrint} />}

            {/* Add Invoice Modal */}
            <AddInvoiceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleInvoiceCreated}
            />

            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                                <h1 className="text-4xl font-bold">Billing</h1>
                            </div>
                            <p className="text-emerald-100 mt-2">
                                Manage invoices, payments, and subscriptions
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-white text-green-600 hover:bg-white/90 gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Create Invoice
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                                <div className="text-4xl font-bold mt-2">{formatCurrency(monthlyRevenue)}</div>
                            </div>
                            <div className="rounded-2xl p-4 bg-green-500/10">
                                <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                                <div className="text-4xl font-bold mt-2">{formatCurrency(outstandingAmount)}</div>
                            </div>
                            <div className="rounded-2xl p-4 bg-blue-500/10">
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-5"></div>
                    <CardContent className="relative p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                                <div className="text-4xl font-bold mt-2">{invoices.length}</div>
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
                                <p className="text-sm font-medium text-muted-foreground">Paid Invoices</p>
                                <div className="text-4xl font-bold mt-2">
                                    {invoices.filter(inv => inv.status === 'paid').length}
                                </div>
                            </div>
                            <div className="rounded-2xl p-4 bg-amber-500/10">
                                <TrendingUp className="h-8 w-8 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Invoices */}
                <div className="lg:col-span-2">
                    <Card className="shadow-lg border-0">
                        <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                            <CardTitle>Recent Invoices</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {invoices.length === 0 ? (
                                <div className="p-12 text-center">
                                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground mb-4">No invoices yet</p>
                                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create Your First Invoice
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b bg-muted/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Invoice ID</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {invoices.map((invoice) => (
                                                <tr key={invoice.id} className="hover:bg-accent/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-sm font-semibold">
                                                            {invoice.invoiceNumber}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{invoice.customerName}</td>
                                                    <td className="px-6 py-4 text-sm">{invoice.issueDate}</td>
                                                    <td className="px-6 py-4 font-semibold">
                                                        {formatCurrency(invoice.amount)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant={invoice.status === "paid" ? "success" : "warning"}>
                                                            {invoice.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="gap-2"
                                                            onClick={() => handleDownloadInvoice(invoice)}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            Download
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Payment Method */}
                <div className="space-y-6">
                    <Card className="shadow-lg border-0">
                        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                            <CardTitle>Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <CreditCard className="h-8 w-8" />
                                    <span className="text-sm">VISA</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="font-mono text-lg tracking-wider">
                                        •••• •••• •••• 4242
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>John Doe</span>
                                        <span>12/25</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full mt-4">
                                Update Payment Method
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                            <CardTitle>Next Billing Date</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/50">
                                <Calendar className="h-8 w-8 text-purple-600" />
                                <div>
                                    <p className="font-semibold">April 15, 2025</p>
                                    <p className="text-sm text-muted-foreground">{formatCurrency(1450.00)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
