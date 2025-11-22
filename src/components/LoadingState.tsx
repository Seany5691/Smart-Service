import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({ message = "Loading...", fullScreen = false }: LoadingStateProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 lg:h-16 lg:w-16 animate-spin text-primary" />
          <p className="text-base lg:text-lg font-medium text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-8 lg:p-12 text-center">
        <Loader2 className="h-10 w-10 lg:h-12 lg:w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-base lg:text-lg text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

// Skeleton components for better perceived performance
export function SkeletonCard() {
  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-4 lg:p-6">
        <div className="space-y-3">
          <div className="h-4 bg-accent rounded animate-pulse" />
          <div className="h-4 bg-accent rounded animate-pulse w-3/4" />
          <div className="h-4 bg-accent rounded animate-pulse w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonTable() {
  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-0">
        <div className="space-y-3 p-4 lg:p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-12 w-12 bg-accent rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-accent rounded animate-pulse w-3/4" />
                <div className="h-3 bg-accent rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="shadow-lg border-0">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-accent rounded animate-pulse w-24" />
                <div className="h-8 bg-accent rounded animate-pulse w-16" />
              </div>
              <div className="h-12 w-12 bg-accent rounded-xl animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
