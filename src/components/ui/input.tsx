import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    /**
     * Error message to display for accessibility
     */
    error?: string;
    /**
     * Label text for accessibility (used for aria-label if no visible label)
     */
    label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, label, "aria-label": ariaLabel, "aria-describedby": ariaDescribedBy, id, ...props }, ref) => {
        const errorId = error && id ? `${id}-error` : undefined;
        const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined;

        return (
            <>
                <input
                    type={type}
                    className={cn(
                        "flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-smooth file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-ring disabled:cursor-not-allowed disabled:opacity-50 lg:h-10 lg:text-sm",
                        error && "border-destructive focus:ring-destructive",
                        className
                    )}
                    ref={ref}
                    id={id}
                    aria-label={ariaLabel || label}
                    aria-describedby={describedBy}
                    aria-invalid={error ? "true" : undefined}
                    // Optimize keyboard types for mobile
                    inputMode={
                        type === "email" ? "email" :
                        type === "tel" ? "tel" :
                        type === "number" ? "numeric" :
                        type === "url" ? "url" :
                        type === "search" ? "search" :
                        undefined
                    }
                    {...props}
                />
                {error && errorId && (
                    <span 
                        id={errorId} 
                        className="text-sm text-destructive mt-1" 
                        role="alert"
                        aria-live="polite"
                    >
                        {error}
                    </span>
                )}
            </>
        );
    }
);
Input.displayName = "Input";

export { Input };
