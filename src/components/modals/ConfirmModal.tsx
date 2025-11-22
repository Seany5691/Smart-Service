"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            gradient: "from-red-500 to-rose-600",
            iconBg: "bg-red-100 dark:bg-red-900/20",
            iconColor: "text-red-600",
            buttonClass: "bg-red-600 hover:bg-red-700",
        },
        warning: {
            gradient: "from-amber-500 to-orange-600",
            iconBg: "bg-amber-100 dark:bg-amber-900/20",
            iconColor: "text-amber-600",
            buttonClass: "bg-amber-600 hover:bg-amber-700",
        },
        info: {
            gradient: "from-blue-500 to-indigo-600",
            iconBg: "bg-blue-100 dark:bg-blue-900/20",
            iconColor: "text-blue-600",
            buttonClass: "bg-blue-600 hover:bg-blue-700",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header with Gradient */}
                <div className={`relative overflow-hidden bg-gradient-to-r ${styles.gradient} p-6 text-white`}>
                    <div className="absolute inset-0 bg-grid-white/10"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 ${styles.iconBg} bg-white/20`}>
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold">{title}</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white hover:bg-white/20"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-muted-foreground">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 pt-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 ${styles.buttonClass} text-white`}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
