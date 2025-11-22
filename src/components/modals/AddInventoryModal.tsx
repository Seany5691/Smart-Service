"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { inventoryService } from "@/lib/firebase/services";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/currency";

interface AddInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddInventoryModal({ isOpen, onClose, onSuccess }: AddInventoryModalProps) {
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        quantity: "",
        location: "",
        unitPrice: "",
        notes: "",
    });

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                name: "",
                category: "",
                quantity: "",
                location: "",
                unitPrice: "",
                notes: "",
            });
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error("Please provide an item name");
            return;
        }

        if (!formData.category.trim()) {
            toast.error("Please provide a category");
            return;
        }

        const quantity = parseInt(formData.quantity);
        if (isNaN(quantity) || quantity < 0) {
            toast.error("Please provide a valid quantity");
            return;
        }

        if (!formData.location.trim()) {
            toast.error("Please provide a location");
            return;
        }

        const unitPrice = parseFloat(formData.unitPrice);
        if (isNaN(unitPrice) || unitPrice < 0) {
            toast.error("Please provide a valid unit price");
            return;
        }

        setLoading(true);

        try {
            // Calculate status based on quantity
            const status = inventoryService.calculateStatus(quantity);

            const inventoryData = {
                name: formData.name.trim(),
                category: formData.category.trim(),
                quantity: quantity,
                location: formData.location.trim(),
                unitPrice: unitPrice,
                status: status,
                notes: formData.notes.trim() || null,
            };

            await inventoryService.create(inventoryData);
            toast.success("Inventory item added successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error adding inventory item:", error);
            toast.error("Failed to add inventory item. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
                <div className="flex items-center justify-between border-b p-6">
                    <h2 className="text-2xl font-bold">Add Inventory Item</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Item Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Item Name *</label>
                        <Input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Yealink T46S IP Phone"
                        />
                    </div>

                    {/* Category and Location */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category *</label>
                            <Input
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="e.g., Telephony, Networking"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location *</label>
                            <Input
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., Warehouse A, Storage Room"
                            />
                        </div>
                    </div>

                    {/* Quantity and Unit Price */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity *</label>
                            <Input
                                type="number"
                                required
                                min="0"
                                step="1"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="0"
                            />
                            {formData.quantity && parseInt(formData.quantity) < 10 && parseInt(formData.quantity) > 0 && (
                                <p className="text-xs text-amber-600">
                                    ⚠️ Low stock warning (below 10 units)
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Unit Price (R) *</label>
                            <Input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.unitPrice}
                                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                placeholder="0.00"
                            />
                            {formData.unitPrice && formData.quantity && (
                                <p className="text-xs text-muted-foreground">
                                    Total value: {formatCurrency(parseFloat(formData.unitPrice) * parseInt(formData.quantity))}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notes (Optional)</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-ring"
                            placeholder="Additional notes about this item..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Item"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
