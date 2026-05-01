import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PortalErrorProps {
  message?: string;
  onRetry?: () => void;
}

const PortalError = ({ message = "Something went wrong loading this page.", onRetry }: PortalErrorProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
    <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
      <AlertCircle size={28} className="text-destructive" />
    </div>
    <div>
      <p className="font-semibold text-base">Unable to load data</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{message}</p>
    </div>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
        <RefreshCw size={14} /> Try Again
      </Button>
    )}
  </div>
);

export default PortalError;
