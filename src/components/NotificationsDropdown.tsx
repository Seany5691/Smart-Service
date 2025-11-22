"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, X, Ticket, Users, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notificationService, Notification } from "@/lib/firebase/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsDropdown() {
    const { user } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user?.uid) return;

        const unsubscribe = notificationService.subscribeToNotifications(
            user.uid,
            (data) => setNotifications(data)
        );

        return () => unsubscribe();
    }, [user?.uid]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await notificationService.markAsRead(notificationId);
    };

    const handleMarkAllAsRead = async () => {
        if (user?.uid) {
            await notificationService.markAllAsRead(user.uid);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (notification.id && !notification.read) {
            await notificationService.markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
        setIsOpen(false);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'ticket':
                return <Ticket className="h-4 w-4" />;
            case 'customer':
                return <Users className="h-4 w-4" />;
            case 'sla':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'ticket':
                return 'bg-blue-500/10 text-blue-600';
            case 'customer':
                return 'bg-emerald-500/10 text-emerald-600';
            case 'sla':
                return 'bg-red-500/10 text-red-600';
            default:
                return 'bg-slate-500/10 text-slate-600';
        }
    };

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return "Just now";
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return formatDistanceToNow(date, { addSuffix: true });
        } catch {
            return "Just now";
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative hover:bg-blue-100 dark:hover:bg-blue-900/20"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 rounded-2xl border bg-card shadow-2xl z-50 animate-in fade-in zoom-in duration-200">
                    {/* Header */}
                    <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                        <div className="absolute inset-0 bg-grid-white/10"></div>
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                <h3 className="font-semibold">Notifications</h3>
                                {unreadCount > 0 && (
                                    <Badge className="bg-white/20 text-white border-white/30">
                                        {unreadCount} new
                                    </Badge>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="mx-auto h-12 w-12 text-muted-foreground/20 mb-3" />
                                <p className="text-sm text-muted-foreground">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.slice(0, 10).map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 cursor-pointer transition-colors hover:bg-accent/50 ${
                                            !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`rounded-lg p-2 ${getIconColor(notification.type)}`}>
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm font-medium ${
                                                        !notification.read ? 'text-foreground' : 'text-muted-foreground'
                                                    }`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => notification.id && handleMarkAsRead(notification.id, e)}
                                                            className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatTimestamp(notification.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t p-3 bg-accent/30">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                className="w-full text-xs"
                                disabled={unreadCount === 0}
                            >
                                Mark all as read
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
