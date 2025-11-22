"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Package,
    Search,
    Plus,
    TrendingUp,
    AlertTriangle,
    Box,
} from "lucide-react";
import { inventoryService } from "@/lib/firebase/services";
import { formatCurrency } from "@/lib/utils/currency";
import AddInventoryModal from "@/components/modals/AddInventoryModal";
import { toast } from "sonner";

export default function InventoryPage() {
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState({
        totalItems: 0,
        inStock: 0,
        lowStock: 0,
        totalValue: 0,
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const loadInventory = async () => {
        try {
            setLoading(true);
            const [items, statsData] = await Promise.all([
                inventoryService.getAll(),
                inventoryService.getStats(),
            ]);
            
            // Calculate status for each item
            const itemsWithStatus = items.map((item: any) => ({
                ...item,
                status: inventoryService.calculateStatus(item.quantity || 0),
            }));
            
            setInventoryItems(itemsWithStatus);
            setStats(statsData);
        } catch (error) {
            console.error("Error loading inventory:", error);
            toast.error("Failed to load inventory data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const filteredItems = inventoryItems.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statsCards = [
        {
            name: "Total Items",
            value: loading ? "..." : stats.totalItems.toString(),
            icon: Package,
            gradient: "from-blue-500 to-indigo-600",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-600",
        },
        {
            name: "In Stock",
            value: loading ? "..." : stats.inStock.toString(),
            icon: Box,
            gradient: "from-emerald-500 to-teal-600",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-600",
        },
        {
            name: "Low Stock",
            value: loading ? "..." : stats.lowStock.toString(),
            icon: AlertTriangle,
            gradient: "from-amber-500 to-orange-600",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-600",
        },
        {
            name: "Value",
            value: loading ? "..." : formatCurrency(stats.totalValue),
            icon: TrendingUp,
            gradient: "from-purple-500 to-pink-600",
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-600",
        },
    ];

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 p-4 sm:p-6 lg:p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Inventory</h1>
                        </div>
                        <p className="text-orange-100 mt-2 text-sm sm:text-base">
                            Manage hardware stock and equipment
                        </p>
                    </div>
                    <Button 
                        size="lg"
                        className="gap-2 bg-white text-orange-600 hover:bg-orange-50 shadow-lg w-full sm:w-auto min-h-[44px]"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus className="h-5 w-5" />
                        Add Item
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat) => (
                    <Card key={stat.name} className="relative overflow-hidden border-0 shadow-lg">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`}></div>
                        <CardContent className="relative p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.name}</p>
                                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2">{stat.value}</div>
                                </div>
                                <div className={`rounded-2xl p-3 sm:p-4 ${stat.iconBg}`}>
                                    <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search */}
            <Card className="shadow-lg border-0">
                <CardContent className="p-4 sm:p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search inventory by name or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 border-0 bg-accent/50 focus-visible:ring-2 h-11 text-base"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Inventory Table */}
            <Card className="shadow-lg border-0">
                <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Inventory Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Item Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Unit Price</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                                        <td className="px-6 py-4 font-medium">{item.name}</td>
                                        <td className="px-6 py-4 text-sm">{item.category}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-semibold ${
                                                    item.status === "low-stock" ? "text-amber-600" : 
                                                    item.status === "out-of-stock" ? "text-red-600" : ""
                                                }`}>
                                                    {item.quantity}
                                                </span>
                                                {item.status === "low-stock" && (
                                                    <Badge variant="warning" className="text-xs">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Low
                                                    </Badge>
                                                )}
                                                {item.status === "out-of-stock" && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Out
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {formatCurrency(item.unitPrice || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">{item.location}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                item.status === "in-stock" ? "success" : 
                                                item.status === "low-stock" ? "warning" : 
                                                "destructive"
                                            }>
                                                {item.status === "in-stock" ? "In Stock" : 
                                                 item.status === "low-stock" ? "Low Stock" : 
                                                 "Out of Stock"}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden">
                        {filteredItems.length === 0 ? (
                            <div className="p-8 sm:p-16 text-center">
                                <Package className="mx-auto h-16 w-16 text-muted-foreground/20 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                                <p className="text-muted-foreground text-sm">
                                    {searchQuery ? "Try adjusting your search" : "Add your first inventory item"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 p-4">
                                {filteredItems.map((item) => (
                                    <Card key={item.id} className="border shadow-sm active:bg-accent/50 transition-colors">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-base mb-1">{item.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{item.category}</p>
                                                </div>
                                                <Badge variant={
                                                    item.status === "in-stock" ? "success" : 
                                                    item.status === "low-stock" ? "warning" : 
                                                    "destructive"
                                                }>
                                                    {item.status === "in-stock" ? "In Stock" : 
                                                     item.status === "low-stock" ? "Low Stock" : 
                                                     "Out of Stock"}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Quantity</p>
                                                    <p className={`font-semibold ${
                                                        item.status === "low-stock" ? "text-amber-600" : 
                                                        item.status === "out-of-stock" ? "text-red-600" : ""
                                                    }`}>
                                                        {item.quantity}
                                                        {item.status === "low-stock" && (
                                                            <AlertTriangle className="inline h-3 w-3 ml-1" />
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Unit Price</p>
                                                    <p className="font-semibold">{formatCurrency(item.unitPrice || 0)}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-muted-foreground text-xs">Location</p>
                                                    <p className="font-medium">{item.location}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Add Inventory Modal */}
            <AddInventoryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={loadInventory}
            />
        </div>
    );
}
