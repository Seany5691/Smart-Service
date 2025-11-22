"use client";

import { useState, useEffect } from "react";
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
    Users,
    Check,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { userService } from "@/lib/firebase/users";
import { updateUserPassword } from "@/lib/firebase/auth";
import { settingsService } from "@/lib/firebase/settings";

export default function SettingsPage() {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
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
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [defaultAssignees, setDefaultAssignees] = useState<string[]>([]);
    const [savingAssignees, setSavingAssignees] = useState(false);

    // Load user profile data and preferences on mount
    useEffect(() => {
        const loadUserData = async () => {
            if (!user?.uid) return;
            
            try {
                setLoading(true);
                
                // Load user profile
                const userProfile = await userService.getUserById(user.uid);
                if (userProfile) {
                    setProfileData({
                        firstName: userProfile.firstName || "",
                        lastName: userProfile.lastName || "",
                        email: userProfile.email || "",
                        phone: userProfile.phone || "",
                    });
                }
                
                // Load user preferences
                const userPreferences = await userService.getUserPreferences(user.uid);
                if (userPreferences?.notifications) {
                    setNotifications(userPreferences.notifications);
                }

                // Load all users and default assignees
                const [users, assignees] = await Promise.all([
                    settingsService.getAllUsers(),
                    settingsService.getDefaultAssignees()
                ]);
                setAllUsers(users);
                setDefaultAssignees(assignees);
            } catch (error) {
                console.error("Error loading user data:", error);
                toast.error("Failed to load user data");
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [user?.uid]);

    const handleSaveProfile = async () => {
        if (!user?.uid) {
            toast.error("User not authenticated");
            return;
        }

        setSaving(true);
        try {
            // Construct displayName from firstName and lastName
            const displayName = profileData.firstName && profileData.lastName
                ? `${profileData.firstName} ${profileData.lastName}`
                : profileData.firstName || profileData.lastName || null;
            
            await userService.updateUserProfile(user.uid, {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                displayName: displayName,
                phone: profileData.phone,
            });
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        // Validate that all fields are filled
        if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
            toast.error("Please fill in all password fields");
            return;
        }

        // Validate new password length (minimum 6 characters)
        if (passwordData.new.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        // Verify passwords match before submission
        if (passwordData.new !== passwordData.confirm) {
            toast.error("Passwords do not match");
            return;
        }

        setSaving(true);
        try {
            // Update password using Firebase Auth
            const { error } = await updateUserPassword(passwordData.current, passwordData.new);
            
            if (error) {
                toast.error(error);
            } else {
                toast.success("Password updated successfully!");
                setPasswordData({ current: "", new: "", confirm: "" });
            }
        } catch (error) {
            console.error("Error updating password:", error);
            toast.error("Failed to update password");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleNotification = async (key: keyof typeof notifications) => {
        if (!user?.uid) {
            toast.error("User not authenticated");
            return;
        }

        const newValue = !notifications[key];
        
        // Optimistically update UI
        setNotifications(prev => ({ ...prev, [key]: newValue }));
        
        try {
            // Save to Firebase
            await userService.updateUserPreferences(user.uid, {
                notifications: {
                    ...notifications,
                    [key]: newValue,
                },
            });
            toast.success("Notification preference updated");
        } catch (error) {
            console.error("Error updating notification preference:", error);
            // Revert on error
            setNotifications(prev => ({ ...prev, [key]: !newValue }));
            toast.error("Failed to update notification preference");
        }
    };

    const handleToggleAssignee = (userId: string) => {
        setDefaultAssignees(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleSaveDefaultAssignees = async () => {
        setSavingAssignees(true);
        try {
            await settingsService.updateDefaultAssignees(defaultAssignees);
            toast.success("Default assignees updated successfully!");
        } catch (error) {
            console.error("Error updating default assignees:", error);
            toast.error("Failed to update default assignees");
        } finally {
            setSavingAssignees(false);
        }
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
            id: "assignees",
            name: "Default Assignees",
            icon: Users,
            gradient: "from-green-500 to-emerald-600",
            description: "Manage who can be assigned tickets",
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
                        <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`}></div>
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
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                        </div>
                    ) : (
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
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <Input 
                                    type="tel" 
                                    placeholder="+27 82 123 4567" 
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
                    )}
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

            {/* Default Assignees */}
            <Card className="shadow-lg border-0">
                <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        Default Assignees
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Select which users can be assigned tickets. If no users are selected, all active users will be available for assignment.
                        </p>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {allUsers.map((user) => (
                                <div 
                                    key={user.id} 
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                                    onClick={() => handleToggleAssignee(user.id)}
                                >
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                        defaultAssignees.includes(user.id)
                                            ? 'bg-green-600 border-green-600'
                                            : 'border-gray-300'
                                    }`}>
                                        {defaultAssignees.includes(user.id) && (
                                            <Check className="h-3 w-3 text-white" />
                                        )}
                                    </div>
                                </div>
                            ))}
                            {allUsers.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">
                                    No users found
                                </p>
                            )}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                {defaultAssignees.length === 0 
                                    ? "All users can be assigned" 
                                    : `${defaultAssignees.length} user${defaultAssignees.length > 1 ? 's' : ''} selected`
                                }
                            </p>
                            <Button 
                                onClick={handleSaveDefaultAssignees}
                                disabled={savingAssignees}
                                className="gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {savingAssignees ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
