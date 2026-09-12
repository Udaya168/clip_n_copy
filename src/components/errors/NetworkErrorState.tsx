import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NetworkErrorStateProps {
  onRetry?: () => void;
  fullPage?: boolean;
}

export function NetworkErrorState({ onRetry, fullPage = true }: NetworkErrorStateProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const content = (
    <div className="mx-auto flex max-w-md flex-col items-center text-center font-sans p-6">
      {/* Wifi Off Icon Badge */}
      <div className="relative mb-6 flex size-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-sm">
        <WifiOff className="size-10" />
      </div>

      {/* Status Badge */}
      <span className="mb-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
        Network Error
      </span>

      {/* Title */}
      <h1 className="text-2xl font-black text-slate-900 sm:text-3xl tracking-tight">
        Connection Problem
      </h1>

      {/* Subtitle */}
      <p className="mt-3 text-base font-medium text-slate-500 max-w-sm leading-relaxed">
        We couldn't connect to Clip N Copy. Please check your internet connection and try again.
      </p>

      {/* Action Button */}
      <div className="mt-8 flex items-center justify-center w-full sm:w-auto">
        <Button
          onClick={handleRetry}
          className="w-full sm:w-auto h-12 rounded-xl bg-[#0647E8] px-8 text-base font-bold text-white shadow-md hover:bg-[#062BCB] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw className="size-4" />
          Try Again
        </Button>
      </div>
    </div>
  );

  if (!fullPage) {
    return content;
  }

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center bg-slate-50/50">
      {content}
    </div>
  );
}

export default NetworkErrorState;
