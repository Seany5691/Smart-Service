"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Mail,
    Key,
    Save,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function SettingsPage() {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: "",
        lastName: "",
        email: user?.email || "",
        phone: "",
    });
    const [passwordData, setPasswordData] = useState({
        current: "",
        new: "",
        confirm: "",
    });
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        weekly: false,
    });

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            // Simulate save
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (passwordData.new !== passwordData.confirm) {
            toast.error("Passwords do not match");
            return;
        }
        if (passwordData.new.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setSaving(true);
        try {
            // Simulate password update
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Password updated successfully!");
            setPasswordData({ current: "", new: "", confirm: "" });
        } catch (error) {
            toast.error("Failed to update password");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        toast.success("Notification preference updated");
    };
    const settingsSections = [
        {
            id: "profile",
            name: "Profile Settings",
            icon: User,
            gradient: "from-blue-500 to-indigo-600",
            description: "Manage your personal information",
        },
        {
            id: "notifications",
            name: "Notifications",
            icon: Bell,
            gradient: "from-amber-500 to-orange-600",
            description: "Configure notification preferences",
        },
        {
            id: "security",
            name: "Security",
            icon: Shield,
            gradient: "from-red-500 to-rose-600",
            description: "Password and authentication settings",
        },
        {
            id: "appearance",
            name: "Appearance",
            icon: Palette,
            gradient: "from-purple-500 to-pink-600",
            description: "Customize the look and feel",
        },
        {
            id: "integrations",
            name: "Integrations",
            icon: Globe,
            gradient: "from-emerald-500 to-teal-600",
            description: "Connect external services",
        },
        {
            id: "email",
            name: "Email Settings",
            icon: Mail,
            gradient: "from-cyan-500 to-blue-600",
            description: "Configure email templates",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                            <SettingsIcon className="h-6 w-6" />
                        </div>
                        <h1 className="text-4xl font-bold">Settings</h1>
                    </div>
                    <p className="text-slate-300 mt-2">
                        Manage your account and application preferences
                    </p>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {settingsSections.map((section) => (
                    <Card 
                        key={section.id} 
                        className="group cursor-pointer hover:shadow-2xl transition-all border-0 shadow-lg overflow-hidden"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                        <CardContent className="relative p-6">
                            <div className="flex items-start gap-4">
                                <div className={`rounded-xl p-3 bg-gradient-to-br ${section.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                                    <section.icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors">
                                        {section.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {section.description}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Profile Settings */}
            <Card className="shadow-lg border-0">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Profile Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">First Name</label>
                                <Input 
                                    placeholder="John" 
                                    value={profileData.firstName}
                                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Last Name</label>
                                <Input 
                                    placeholder="Doe" 
                                    value={profileData.lastName}
                                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input 
                                type="email" 
                                value={profileData.email}
                                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                disabled
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number</label>
                            <Input 
                                type="tel" 
                                placeholder="+1 (555) 123-4567" 
                                value={profileData.phone}
                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button className="gap-2" onClick={handleSaveProfile} disabled={saving}>
                                <Save className="h-4 w-4" />
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="shadow-lg border-0">
                <CardHeader className="border-b bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        Security Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Current Password</label>
                            <Input 
                                type="password" 
                                placeholder="••••••••" 
                                value={passwordData.current}
                                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">New Password</label>
                            <Input 
                                type="password" 
                                placeholder="••••••••" 
                                value={passwordData.new}
                                onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm New Password</label>
                            <Input 
                                type="password" 
                                placeholder="••••••••" 
                                value={passwordData.confirm}
                                onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                            />
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                                <p className="font-medium">Two-Factor Authentication</p>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                            </div>
                            <Badge variant="outline">Not Enabled</Badge>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button className="gap-2" onClick={handleUpdatePassword} disabled={saving}>
                                <Key className="h-4 w-4" />
                                {saving ? "Updating..." : "Update Password"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="shadow-lg border-0">
                <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-amber-600" />
                        Notification Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {[
                            { key: 'email' as const, label: "Email Notifications", description: "Receive email updates for new tickets" },
                            { key: 'push' as const, label: "Push Notifications", description: "Get browser notifications for urgent tickets" },
                            { key: 'sms' as const, label: "SMS Alerts", description: "Receive text messages for critical issues" },
                            { key: 'weekly' as const, label: "Weekly Summary", description: "Get a weekly report of your activity" },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border hover:bg-accent/50 transition-colors">
                                <div>
                                    <p className="font-medium">{item.label}</p>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={notifications[item.key]}
                                        onChange={() => handleToggleNotification(item.key)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
