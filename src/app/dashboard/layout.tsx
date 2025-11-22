"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/firebase/auth";
import { toast } from "sonner";
import {
    LayoutDashboard,
    Ticket,
    Users,
    Package,
    FileText,
    Settings,
    Menu,
    X,
    Sun,
    Moon,
    LogOut,
    BarChart3,
    DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import { SkipNavigation } from "@/components/SkipNavigation";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: undefined },
    { name: "Tickets", href: "/dashboard/tickets", icon: Ticket, badge: undefined },
    { name: "Customers", href: "/dashboard/customers", icon: Users, badge: undefined },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, badge: undefined },
    { name: "Billing", href: "/dashboard/billing", icon: DollarSign, badge: undefined },
    { name: "Inventory", href: "/dashboard/inventory", icon: Package, badge: undefined },
    { name: "Reports", href: "/dashboard/reports", icon: FileText, badge: undefined },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, badge: undefined },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        const { error } = await logout();
        if (error) {
            toast.error("Failed to logout");
        } else {
            toast.success("Logged out successfully");
            router.push("/login");
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle("dark");
    };

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render dashboard if not authenticated
    if (!user) {
        return null;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Skip Navigation for Accessibility */}
            <SkipNavigation />

            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    role="button"
                    aria-label="Close navigation menu"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setSidebarOpen(false);
                        }
                    }}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-r border-border/50 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-xl",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
                aria-label="Main navigation"
                role="navigation"
            >
                <div className="flex h-full flex-col">
                    {/* Logo with Gradient */}
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"></div>
                        <div className="absolute inset-0 bg-grid-white/10"></div>
                        <div className="relative flex h-16 items-center justify-between px-6 text-white">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                                    <Ticket className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold">Smart Service</h1>
                                    <p className="text-xs text-blue-100">Ticketing System</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden text-white hover:bg-white/20"
                                onClick={() => setSidebarOpen(false)}
                                aria-label="Close navigation menu"
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </Button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin" aria-label="Primary navigation">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                                            : "text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md hover:scale-[1.01]"
                                    )}
                                    onClick={() => setSidebarOpen(false)}
                                    aria-current={isActive ? "page" : undefined}
                                    aria-label={`${item.name}${item.badge ? ` (${item.badge} items)` : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon 
                                            className={cn(
                                                "h-5 w-5 transition-transform group-hover:scale-110",
                                                isActive ? "text-white" : "text-slate-600 dark:text-slate-400"
                                            )}
                                            aria-hidden="true"
                                        />
                                        <span>{item.name}</span>
                                    </div>
                                    {item.badge && (
                                        <Badge 
                                            variant={isActive ? "secondary" : "outline"} 
                                            className={cn(
                                                "ml-auto",
                                                isActive && "bg-white/20 text-white border-white/30"
                                            )}
                                            aria-label={`${item.badge} items`}
                                        >
                                            {item.badge}
                                        </Badge>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="border-t border-border/50 p-4">
                        <div className="flex items-center gap-3 rounded-xl bg-white/60 dark:bg-slate-800/60 p-3 shadow-md">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-lg">
                                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">
                                    {user?.displayName || "User"}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top header */}
                <header className="relative overflow-hidden border-b border-border/50 shadow-md" role="banner">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20" aria-hidden="true"></div>
                    
                    <div className="relative flex h-16 items-center justify-between backdrop-blur-sm px-4 lg:px-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:scale-110 transition-transform"
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Open navigation menu"
                                aria-expanded={sidebarOpen}
                                aria-controls="main-navigation"
                            >
                                <Menu className="h-5 w-5" aria-hidden="true" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-600 to-indigo-600" aria-hidden="true"></div>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {navigation.find((item) => item.href === pathname || pathname.startsWith(item.href + '/'))?.name || "Dashboard"}
                                </h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-2" role="toolbar" aria-label="User actions">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={toggleDarkMode}
                                className="hover:bg-amber-100 dark:hover:bg-amber-900/20 hover:scale-110 transition-all"
                                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {darkMode ? (
                                    <Sun className="h-5 w-5 text-amber-600" aria-hidden="true" />
                                ) : (
                                    <Moon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                                )}
                            </Button>
                            <NotificationsDropdown />
                            <div className="h-6 w-px bg-border mx-1" aria-hidden="true"></div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleLogout} 
                                aria-label="Logout"
                                className="hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 hover:scale-110 transition-all"
                            >
                                <LogOut className="h-5 w-5" aria-hidden="true" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main 
                    id="main-content" 
                    className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 lg:p-6"
                    role="main"
                    aria-label="Main content"
                    tabIndex={-1}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
