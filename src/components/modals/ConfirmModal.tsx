"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import MobileModal from "@/components/MobileModal";

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
        <MobileModal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            size="sm"
            footer={
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-12 lg:h-10"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 h-12 lg:h-10 ${styles.buttonClass} text-white`}
                    >
                        {confirmText}
                    </Button>
                </div>
            }
        >
            {/* Header with Gradient */}
            <div className={`relative overflow-hidden bg-gradient-to-r ${styles.gradient} -m-4 lg:-m-6 mb-4 lg:mb-6 p-4 lg:p-6 text-white rounded-t-xl lg:rounded-t-none`}>
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative flex items-center gap-3">
                    <div className={`rounded-full p-2 ${styles.iconBg} bg-white/20 flex-shrink-0`}>
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <h2 className="text-lg lg:text-xl font-bold">{title}</h2>
                </div>
            </div>

            {/* Content */}
            <div className="py-2">
                <p className="text-muted-foreground text-base">{message}</p>
            </div>
        </MobileModal>
    );
}
