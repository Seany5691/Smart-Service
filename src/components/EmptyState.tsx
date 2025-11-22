import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-8 lg:p-16 text-center">
        <div className="flex flex-col items-center max-w-md mx-auto">
          {/* Icon with gradient background */}
          <div className="mb-6 rounded-2xl p-4 lg:p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <Icon className="h-12 w-12 lg:h-16 lg:w-16 text-primary/40" />
          </div>
          
          {/* Title */}
          <h3 className="text-lg lg:text-xl font-semibold mb-2">{title}</h3>
          
          {/* Description */}
          <p className="text-sm lg:text-base text-muted-foreground mb-6 lg:mb-8">
            {description}
          </p>
          
          {/* Actions - Touch-friendly buttons */}
          {(actionLabel || secondaryActionLabel) && (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {actionLabel && onAction && (
                <Button
                  onClick={onAction}
                  size="lg"
                  className="w-full sm:w-auto min-h-[44px]"
                >
                  {actionLabel}
                </Button>
              )}
              {secondaryActionLabel && onSecondaryAction && (
                <Button
                  onClick={onSecondaryAction}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto min-h-[44px]"
                >
                  {secondaryActionLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
