"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Trash2 } from "lucide-react";
import { invoiceService, customerService } from "@/lib/firebase/services";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/currency";

interface AddInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export default function AddInvoiceModal({ isOpen, onClose, onSuccess }: AddInvoiceModalProps) {
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        customerId: "",
        customerName: "",
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: "",
        notes: "",
    });

    const [items, setItems] = useState<InvoiceItem[]>([
        { description: "", quantity: 1, unitPrice: 0, total: 0 }
    ]);

    // Load customers when modal opens
    useEffect(() => {
        if (isOpen) {
            const loadCustomers = async () => {
                const customersData = await customerService.getAll();
                setCustomers(customersData);
            };
            loadCustomers();
            
            // Set default due date to 30 days from issue date
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);
            setFormData(prev => ({
                ...prev,
                dueDate: dueDate.toISOString().split('T')[0]
            }));
        }
    }, [isOpen]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                customerId: "",
                customerName: "",
                issueDate: new Date().toISOString().split('T')[0],
                dueDate: "",
                notes: "",
            });
            setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
        }
    }, [isOpen]);

    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        setFormData({
            ...formData,
            customerId,
            customerName: customer?.companyName || "",
        });
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
        };

        // Recalculate total for this item
        if (field === 'quantity' || field === 'unitPrice') {
            const quantity = field === 'quantity' ? Number(value) : newItems[index].quantity;
            const unitPrice = field === 'unitPrice' ? Number(value) : newItems[index].unitPrice;
            newItems[index].total = quantity * unitPrice;
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + item.total, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.customerId) {
            toast.error("Please select a customer");
            return;
        }

        if (!formData.issueDate || !formData.dueDate) {
            toast.error("Please provide issue date and due date");
            return;
        }

        // Validate all items have descriptions
        const hasEmptyDescriptions = items.some(item => !item.description.trim());
        if (hasEmptyDescriptions) {
            toast.error("Please provide descriptions for all line items");
            return;
        }

        // Validate at least one item has a non-zero amount
        const totalAmount = calculateSubtotal();
        if (totalAmount <= 0) {
            toast.error("Invoice must have at least one item with a non-zero amount");
            return;
        }

        setLoading(true);

        try {
            // Generate invoice number
            const invoiceNumber = await invoiceService.generateInvoiceNumber();

            const invoiceData = {
                invoiceNumber,
                customerId: formData.customerId,
                customerName: formData.customerName,
                amount: totalAmount,
                issueDate: formData.issueDate,
                dueDate: formData.dueDate,
                status: 'pending',
                items: items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.total,
                })),
                notes: formData.notes || null,
            };

            await invoiceService.create(invoiceData);
            toast.success("Invoice created successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error creating invoice:", error);
            toast.error("Failed to create invoice. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                <div className="flex items-center justify-between border-b p-6">
                    <h2 className="text-2xl font-bold">Create New Invoice</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Customer Selection */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Customer *</label>
                            <select
                                required
                                value={formData.customerId}
                                onChange={(e) => handleCustomerChange(e.target.value)}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-ring"
                            >
                                <option value="">Select a customer...</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.companyName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Issue Date *</label>
                            <Input
                                type="date"
                                required
                                value={formData.issueDate}
                                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Due Date *</label>
                        <Input
                            type="date"
                            required
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            min={formData.issueDate}
                        />
                    </div>

                    {/* Line Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Line Items *</label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addItem}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Item
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-accent/20 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 space-y-3">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-muted-foreground">
                                                    Description *
                                                </label>
                                                <Input
                                                    required
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    placeholder="Service or product description"
                                                />
                                            </div>

                                            <div className="grid gap-3 md:grid-cols-3">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-muted-foreground">
                                                        Quantity *
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        required
                                                        min="1"
                                                        step="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-muted-foreground">
                                                        Unit Price (R) *
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unitPrice}
                                                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-muted-foreground">
                                                        Total
                                                    </label>
                                                    <div className="flex items-center h-10 px-3 rounded-md border bg-muted/50 text-sm font-semibold">
                                                        {formatCurrency(item.total)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(index)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="flex justify-end">
                            <div className="w-full md:w-1/3 space-y-2 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Subtotal:</span>
                                    <span className="text-lg font-semibold">{formatCurrency(calculateSubtotal())}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="text-base font-bold">Total Amount:</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {formatCurrency(calculateSubtotal())}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notes (Optional)</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-ring"
                            placeholder="Additional notes or payment terms..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Invoice"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
