import { useState } from "react";
import { useStoreStatus } from "@/lib/store-status";
import { Store, Power, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function StoreStatusCard() {
  const { settings, isOnline, statusLabel, statusMessage, updateMode, refresh } = useStoreStatus();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (targetOnline: boolean) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await updateMode(targetOnline);
      if (targetOnline) {
        toast.success("Store is now set to ONLINE manually.");
      } else {
        toast.error("Store is now set to OFFLINE manually. New orders are blocked.");
      }
    } catch (err) {
      toast.error("Failed to update store status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const isAutoClosed9PM = statusLabel === "Closed at 9:00 PM";

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-soft space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Store className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-foreground">Store Online / Offline Status</h3>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide",
                  isOnline
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                )}
              >
                <span className="relative flex size-2 shrink-0">
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                      isOnline ? "bg-emerald-500" : "bg-destructive"
                    )}
                  />
                  <span
                    className={cn(
                      "relative inline-flex size-2 rounded-full",
                      isOnline ? "bg-emerald-500" : "bg-destructive"
                    )}
                  />
                </span>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daily Automatic Closing: <span className="font-bold text-foreground">9:00 PM (IST)</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refresh()}
          className="size-8 rounded-full border border-border bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer self-start sm:self-center"
          title="Refresh Store Status"
        >
          <RefreshCw className="size-3.5" />
        </button>
      </div>

      {/* Auto-closed 9 PM notification banner if applicable */}
      {isAutoClosed9PM && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
          <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <p className="font-bold">Store automatically closed at 9:00 PM.</p>
            <p className="mt-0.5 text-[11px] opacity-90">
              {statusMessage || "You can click 'Turn Store ON' below to manually reopen it after 9:00 PM."}
            </p>
          </div>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-2xl border border-border p-3 bg-secondary/30">
          <p className="text-muted-foreground text-[11px]">Manual Override</p>
          <p className="font-bold text-foreground capitalize mt-0.5">
            {settings?.manual_mode === true
              ? "Active (Manual Mode)"
              : "Inactive (Auto Schedule)"}
          </p>
        </div>
        <div className="rounded-2xl border border-border p-3 bg-secondary/30">
          <p className="text-muted-foreground text-[11px]">Status Summary</p>
          <p className="font-bold text-foreground mt-0.5">{statusLabel}</p>
        </div>
        <div className="rounded-2xl border border-border p-3 bg-secondary/30">
          <p className="text-muted-foreground text-[11px]">Order Acceptance</p>
          <p
            className={cn(
              "font-extrabold mt-0.5",
              isOnline ? "text-emerald-600" : "text-destructive"
            )}
          >
            {isOnline ? "Accepting Orders" : "Orders Blocked"}
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => handleToggle(true)}
          className={cn(
            "flex-1 w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold transition-all cursor-pointer border shadow-sm",
            isOnline
              ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30"
              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
          )}
        >
          <Power className="size-4" />
          <span>Turn Store ON</span>
        </button>

        <button
          type="button"
          disabled={isUpdating}
          onClick={() => handleToggle(false)}
          className={cn(
            "flex-1 w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold transition-all cursor-pointer border shadow-sm",
            !isOnline
              ? "bg-destructive text-destructive-foreground border-destructive ring-2 ring-destructive/30"
              : "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
          )}
        >
          <Power className="size-4" />
          <span>Turn Store OFF</span>
        </button>
      </div>
    </div>
  );
}
