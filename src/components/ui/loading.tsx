import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  className?: string;
}

export function Loading({
  message = "Loading...",
  className = "",
}: LoadingProps) {
  return (
    <div className={`container mx-auto py-6 ${className}`}>
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
