import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApplicationErrorFallbackProps {
  onRetry?: () => void;
}

export function ApplicationErrorFallback({ onRetry }: ApplicationErrorFallbackProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center p-6 text-center font-sans bg-slate-50/50">
      <div className="mx-auto flex max-w-md flex-col items-center">
        {/* Error Icon Badge */}
        <div className="relative mb-6 flex size-20 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 shadow-sm">
          <AlertTriangle className="size-10" />
        </div>

        {/* Status Badge */}
        <span className="mb-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-700">
          Application Error
        </span>

        {/* Title */}
        <h1 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight">
          Something went wrong
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-base font-medium text-slate-500 max-w-sm leading-relaxed">
          Something unexpected happened. Please try again.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Button
            onClick={handleRetry}
            className="w-full sm:w-auto h-12 rounded-xl bg-[#0647E8] px-6 text-base font-bold text-white shadow-md hover:bg-[#062BCB] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="size-4" />
            Try Again
          </Button>

          <Button
            variant="outline"
            onClick={handleGoHome}
            className="w-full sm:w-auto h-12 rounded-xl border-slate-200 px-6 text-base font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="size-4" />
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationErrorFallback;
