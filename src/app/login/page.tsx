"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ticket } from "lucide-react";
import { loginWithEmail } from "@/lib/firebase/auth";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { user, error } = await loginWithEmail(formData.email, formData.password);

            if (error) {
                toast.error(error);
            } else if (user) {
                toast.success("Login successful!");
                router.push("/dashboard");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-card shadow-2xl p-8 space-y-6 border">
                    {/* Logo */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg animate-pulse">
                            <Ticket className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold">Smart Service</h1>
                            <p className="text-sm text-muted-foreground">Ticketing System</p>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="admin@example.com"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                disabled={loading}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="rounded-lg bg-muted/50 p-4 text-sm">
                        <p className="font-medium mb-2">Setup Required:</p>
                        <p className="text-muted-foreground">
                            Create a user in Firebase Authentication, then use those credentials to login.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
