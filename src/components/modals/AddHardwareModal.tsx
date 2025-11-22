"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { hardwareService } from "@/lib/firebase/hardware";
import { hardwareOptions } from "@/lib/firebase/settings";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import MobileModal from "@/components/MobileModal";

interface AddHardwareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customerId: string;
    companyName: string;
}

interface HardwareItem {
    id: string;
    hardwareType: string;
    hardwareLabel: string;
    nickname: string;
    serialNumber: string;
    macAddress: string;
    ipAddress: string;
}

export default function AddHardwareModal({ 
    isOpen, 
    onClose, 
    onSuccess, 
    customerId, 
    companyName 
}: AddHardwareModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>([
        {
            id: Date.now().toString(),
            hardwareType: "",
            hardwareLabel: "",
            nickname: "",
            serialNumber: "",
            macAddress: "",
            ipAddress: "",
        }
    ]);

    const handleHardwareChange = (id: string, value: string) => {
        const selected = hardwareOptions.find(h => h.value === value);
        
        // Update the item
        const updatedItems = hardwareItems.map(item =>
            item.id === id
                ? { ...item, hardwareType: value, hardwareLabel: selected?.label || "" }
                : item
        );
        setHardwareItems(updatedItems);

        // Auto-add new dropdown if this is the last one and a value was selected
        if (value) {
            const itemIndex = updatedItems.findIndex(item => item.id === id);
            const isLastItem = itemIndex === updatedItems.length - 1;
            if (isLastItem) {
                // Add new item immediately
                setHardwareItems([
                    ...updatedItems,
                    {
                        id: Date.now().toString(),
                        hardwareType: "",
                        hardwareLabel: "",
                        nickname: "",
                        serialNumber: "",
                        macAddress: "",
                        ipAddress: "",
                    }
                ]);
            }
        }
    };

    const handleFieldChange = (id: string, field: keyof HardwareItem, value: string) => {
        setHardwareItems(items =>
            items.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const addHardwareItem = () => {
        setHardwareItems([
            ...hardwareItems,
            {
                id: Date.now().toString(),
                hardwareType: "",
                hardwareLabel: "",
                nickname: "",
                serialNumber: "",
                macAddress: "",
                ipAddress: "",
            }
        ]);
    };

    const removeHardwareItem = (id: string) => {
        if (hardwareItems.length > 1) {
            setHardwareItems(items => items.filter(item => item.id !== id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Filter out items that don't have hardware selected
        const validItems = hardwareItems.filter(item => item.hardwareType);

        if (validItems.length === 0) {
            toast.error("Please select at least one hardware item");
            return;
        }

        setLoading(true);

        try {
            // Save all hardware items
            for (const item of validItems) {
                const hardwareData: any = {
                    customerId,
                    hardwareType: item.hardwareType,
                    hardwareLabel: item.hardwareLabel,
                    quantity: 1,
                    addedBy: user?.email || "System",
                };

                // Only add optional fields if they have values
                if (item.nickname) hardwareData.nickname = item.nickname;
                if (item.serialNumber) hardwareData.serialNumber = item.serialNumber;
                if (item.macAddress) hardwareData.macAddress = item.macAddress;
                if (item.ipAddress) hardwareData.ipAddress = item.ipAddress;

                await hardwareService.addHardware(hardwareData);
            }

            toast.success(`${validItems.length} hardware item(s) added successfully!`);
            
            // Reset form
            setHardwareItems([
                {
                    id: Date.now().toString(),
                    hardwareType: "",
                    hardwareLabel: "",
                    nickname: "",
                    serialNumber: "",
                    macAddress: "",
                    ipAddress: "",
                }
            ]);

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error adding hardware:", error);
            toast.error("Failed to add hardware. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <MobileModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Add Hardware - ${companyName}`}
            size="lg"
            footer={
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addHardwareItem}
                        className="gap-2 h-12 lg:h-10"
                    >
                        <Plus className="h-4 w-4" />
                        Add Another Hardware
                    </Button>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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
                            form="hardware-form"
                            disabled={loading}
                            className="h-12 lg:h-10"
                        >
                            {loading ? "Saving..." : `Save ${hardwareItems.filter(i => i.hardwareType).length} Item(s)`}
                        </Button>
                    </div>
                </div>
            }
        >
            <form id="hardware-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        {hardwareItems.map((item, index) => (
                            <div key={item.id} className="p-4 border rounded-lg bg-accent/20 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">Hardware Item #{index + 1}</h3>
                                    {hardwareItems.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeHardwareItem(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Hardware Type *</label>
                                    <select
                                        value={item.hardwareType}
                                        onChange={(e) => handleHardwareChange(item.id, e.target.value)}
                                        className="w-full rounded-md border border-input bg-card px-3 py-3 lg:py-2 text-base lg:text-sm focus-ring"
                                    >
                                        <option value="">Select hardware...</option>
                                        {hardwareOptions.map((hardware) => (
                                            <option key={hardware.value} value={hardware.value}>
                                                {hardware.label} ({hardware.category})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {item.hardwareType && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Nickname (Optional)</label>
                                            <Input
                                                value={item.nickname}
                                                onChange={(e) => handleFieldChange(item.id, "nickname", e.target.value)}
                                                placeholder="e.g., Reception Phone, Main Router, Extension 101"
                                                className="h-12 lg:h-10 text-base lg:text-sm"
                                            />
                                        </div>
                                        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Serial Number</label>
                                                <Input
                                                    value={item.serialNumber}
                                                    onChange={(e) => handleFieldChange(item.id, "serialNumber", e.target.value)}
                                                    placeholder="SN123456789"
                                                    className="h-12 lg:h-10 text-base lg:text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">MAC Address</label>
                                                <Input
                                                    value={item.macAddress}
                                                    onChange={(e) => handleFieldChange(item.id, "macAddress", e.target.value)}
                                                    placeholder="00:1A:2B:3C:4D:5E"
                                                    className="h-12 lg:h-10 text-base lg:text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">IP Address</label>
                                                <Input
                                                    value={item.ipAddress}
                                                    onChange={(e) => handleFieldChange(item.id, "ipAddress", e.target.value)}
                                                    placeholder="192.168.1.100"
                                                    className="h-12 lg:h-10 text-base lg:text-sm"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </form>
        </MobileModal>
    );
}
