import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  fullScreen?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  onGoHome,
  fullScreen = false,
}: ErrorStateProps) {
  const content = (
    <div className="flex flex-col items-center text-center max-w-md mx-auto">
      {/* Error icon with gradient background */}
      <div className="mb-6 rounded-2xl p-4 lg:p-6 bg-gradient-to-br from-destructive/10 to-destructive/5">
        <AlertCircle className="h-12 w-12 lg:h-16 lg:w-16 text-destructive" />
      </div>
      
      {/* Title */}
      <h3 className="text-lg lg:text-xl font-semibold mb-2">{title}</h3>
      
      {/* Error message */}
      <p className="text-sm lg:text-base text-muted-foreground mb-6 lg:mb-8">
        {message}
      </p>
      
      {/* Actions - Touch-friendly buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {onRetry && (
          <Button
            onClick={onRetry}
            size="lg"
            className="w-full sm:w-auto min-h-[44px] gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button
            onClick={onGoHome}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto min-h-[44px] gap-2"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4 lg:p-8">
        {content}
      </div>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-8 lg:p-16">
        {content}
      </CardContent>
    </Card>
  );
}

// Network error specific component
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
    />
  );
}

// Permission error component
export function PermissionError({ message }: { message?: string }) {
  return (
    <ErrorState
      title="Access Denied"
      message={message || "You don't have permission to access this resource."}
      onGoHome={() => window.location.href = "/dashboard"}
    />
  );
}

// Not found error component
export function NotFoundError({ resourceName = "resource" }: { resourceName?: string }) {
  return (
    <ErrorState
      title="Not Found"
      message={`The ${resourceName} you're looking for doesn't exist or has been removed.`}
      onGoHome={() => window.location.href = "/dashboard"}
    />
  );
}
