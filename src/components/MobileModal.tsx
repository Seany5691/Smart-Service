"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}

export default function MobileModal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = "lg",
}: MobileModalProps) {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: "lg:max-w-md",
        md: "lg:max-w-2xl",
        lg: "lg:max-w-4xl",
        xl: "lg:max-w-6xl",
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={cn(
                    "fixed bg-card",
                    // Mobile: Full screen
                    "inset-0",
                    // Desktop: Centered with max-width
                    "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2",
                    "lg:rounded-xl lg:max-h-[90vh] lg:m-4",
                    sizeClasses[size],
                    "flex flex-col overflow-hidden"
                )}
            >
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-card border-b px-4 py-3 lg:px-6 lg:py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg lg:text-xl font-semibold truncate pr-4">
                            {title}
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="flex-shrink-0 h-11 w-11 lg:h-10 lg:w-10"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </div>

                {/* Sticky Footer (if provided) */}
                {footer && (
                    <div className="sticky bottom-0 bg-card border-t px-4 py-3 lg:px-6 lg:py-4 flex-shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
