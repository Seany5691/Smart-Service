"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { invoiceService } from "@/lib/firebase/services";
import { toast } from "sonner";

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    invoice?: any;
}

export default function InvoiceModal({ isOpen, onClose, onSuccess, invoice }: InvoiceModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer: invoice?.customer || "",
        issueDate: invoice?.issueDate || new Date().toISOString().split('T')[0],
        dueDate: invoice?.dueDate || "",
        items: invoice?.items || [{ description: "", quantity: 1, unitPrice: 0 }],
        tax: invoice?.tax || 15,
        discount: invoice?.discount || 0,
        notes: invoice?.notes || "",
    });

    const addLineItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: "", quantity: 1, unitPrice: 0 }],
        });
    };

    const removeLineItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_: any, i: number) => i !== index),
        });
    };

    const updateLineItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const calculateSubtotal = () => {
        return formData.items.reduce((sum: number, item: any) =>
            sum + (item.quantity * item.unitPrice), 0
        );
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const taxAmount = (subtotal * formData.tax) / 100;
        return subtotal + taxAmount - formData.discount;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const subtotal = calculateSubtotal();
            const total = calculateTotal();
            const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;

            const invoiceData = {
                ...formData,
                invoiceNumber: invoice?.invoiceNumber || invoiceNumber,
                subtotal,
                total,
                status: invoice?.status || "draft",
            };

            if (invoice) {
                await invoiceService.update(invoice.id, invoiceData);
                toast.success("Invoice updated successfully!");
            } else {
                await invoiceService.create(invoiceData);
                toast.success("Invoice created successfully!");
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving invoice:", error);
            toast.error("Failed to save invoice. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                <div className="flex items-center justify-between border-b p-6">
                    <h2 className="text-2xl font-bold">{invoice ? "Edit Invoice" : "New Invoice"}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Customer *</label>
                            <Input
                                required
                                value={formData.customer}
                                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                placeholder="Customer name"
                            />
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Due Date *</label>
                            <Input
                                type="date"
                                required
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Line Items</label>
                            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                                Add Item
                            </Button>
                        </div>

                        {formData.items.map((item: any, index: number) => (
                            <div key={index} className="grid gap-4 md:grid-cols-12 items-end">
                                <div className="md:col-span-5 space-y-2">
                                    <Input
                                        required
                                        value={item.description}
                                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                        placeholder="Description"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Input
                                        type="number"
                                        required
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value))}
                                        placeholder="Qty"
                                    />
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <Input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={item.unitPrice}
                                        onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value))}
                                        placeholder="Unit Price"
                                    />
                                </div>
                                <div className="md:col-span-2 flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                        R{(item.quantity * item.unitPrice).toFixed(2)}
                                    </span>
                                    {formData.items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeLineItem(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tax (%)</label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.tax}
                                onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Discount (R)</label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.discount}
                                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Total</label>
                            <div className="text-2xl font-bold">R{calculateTotal().toFixed(2)}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-ring"
                            placeholder="Additional notes..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : invoice ? "Save Changes" : "Create Invoice"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
