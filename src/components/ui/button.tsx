import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { hapticButtonPress } from "@/lib/haptics";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-smooth focus-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground shadow hover:bg-primary/90 active:bg-primary/80",
                destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80",
                outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
                secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70",
                ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
                link: "text-primary underline-offset-4 hover:underline",
                success: "bg-success text-success-foreground shadow hover:bg-success/90 active:bg-success/80",
                warning: "bg-warning text-warning-foreground shadow hover:bg-warning/90 active:bg-warning/80",
            },
            size: {
                default: "h-11 px-4 py-2 lg:h-10",
                sm: "h-10 px-3 text-xs lg:h-9",
                lg: "h-12 px-8 lg:h-11",
                icon: "h-11 w-11 lg:h-10 lg:w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    enableHaptic?: boolean;
    /**
     * Loading state for async actions
     */
    isLoading?: boolean;
    /**
     * Icon-only button (requires aria-label)
     */
    iconOnly?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ 
        className, 
        variant, 
        size, 
        enableHaptic = true, 
        isLoading = false,
        iconOnly = false,
        onClick, 
        disabled,
        children,
        "aria-label": ariaLabel,
        ...props 
    }, ref) => {
        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            // Trigger haptic feedback on touch devices
            if (enableHaptic && !disabled && !isLoading) {
                hapticButtonPress();
            }
            
            // Call the original onClick handler
            if (!disabled && !isLoading) {
                onClick?.(e);
            }
        };

        // Warn in development if icon-only button lacks aria-label
        if (process.env.NODE_ENV === 'development' && iconOnly && !ariaLabel) {
            console.warn('Icon-only buttons should have an aria-label for accessibility');
        }

        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                onClick={handleClick}
                disabled={disabled || isLoading}
                aria-label={ariaLabel}
                aria-busy={isLoading ? "true" : undefined}
                aria-disabled={disabled || isLoading ? "true" : undefined}
                {...props}
            >
                {isLoading ? (
                    <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" aria-hidden="true" />
                        <span className="sr-only">Loading...</span>
                        {children && <span className="opacity-70">{children}</span>}
                    </>
                ) : (
                    children
                )}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
