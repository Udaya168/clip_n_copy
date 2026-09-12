import { Link } from "react-router-dom";
import { ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccessDeniedPage() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center p-6 text-center font-sans">
      <div className="mx-auto flex max-w-md flex-col items-center">
        {/* Shield Icon Badge */}
        <div className="relative mb-6 flex size-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-sm">
          <ShieldAlert className="size-10" />
        </div>

        {/* Status Badge */}
        <span className="mb-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
          403 Access Restricted
        </span>

        {/* Title */}
        <h1 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight">
          Access Denied
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-base font-medium text-slate-500 max-w-sm leading-relaxed">
          You don't have permission to access this page.
        </p>

        {/* Action Button */}
        <div className="mt-8 flex items-center justify-center w-full sm:w-auto">
          <Link to="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 rounded-xl bg-[#0647E8] px-8 text-base font-bold text-white shadow-md hover:bg-[#062BCB] transition-all cursor-pointer flex items-center justify-center gap-2">
              <Home className="size-4" />
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AccessDeniedPage;
