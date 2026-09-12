import { Link, useNavigate } from "react-router-dom";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center p-6 text-center font-sans">
      <div className="mx-auto flex max-w-md flex-col items-center">
        {/* Brand Icon Badge */}
        <div className="relative mb-6 flex size-20 items-center justify-center rounded-2xl bg-[#0647E8]/10 text-[#0647E8] shadow-sm">
          <FileQuestion className="size-10" />
        </div>

        {/* Status Badge */}
        <span className="mb-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
          404 Error
        </span>

        {/* Title */}
        <h1 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight">
          Page Not Found
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-base font-medium text-slate-500 max-w-sm leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto h-12 rounded-xl bg-[#0647E8] px-6 text-base font-bold text-white shadow-md hover:bg-[#062BCB] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="size-4" />
            Back to Home
          </Button>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto h-12 rounded-xl border-slate-200 px-6 text-base font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
