import { useState } from "react";
import { useStoreStatus } from "@/lib/store-status";
import { Store, Clock, Power, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function StoreStatusCard() {
  const { settings, isOnline, statusLabel, statusBadge, updateMode, refresh } = useStoreStatus();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleModeChange = async (mode: "auto" | "online" | "offline") => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await updateMode(mode);
      if (mode === "online") {
        toast.success("Store is now set to ONLINE manually.");
      } else if (mode === "offline") {
        toast.error("Store is now set to OFFLINE manually. New orders are blocked.");
      } else {
        toast.info("Store status reset to Auto Operating Hours (Opens at 9:00 AM).");
      }
    } catch (err) {
      toast.error("Failed to update store status.");
    } finally {
      setIsUpdating(false);
    }
  };

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
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase",
                  isOnline
                    ? "bg-emerald-500/10 text-emerald-600"
                    : statusBadge === "before_opening"
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                <span className="relative flex size-2 shrink-0">
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                      isOnline ? "bg-emerald-500" : "bg-amber-500"
                    )}
                  />
                  <span
                    className={cn(
                      "relative inline-flex size-2 rounded-full",
                      isOnline ? "bg-emerald-500" : "bg-destructive"
                    )}
                  />
                </span>
                {statusLabel}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Opening Time: <span className="font-bold text-foreground">9:00 AM Every Day</span>
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

      {/* Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-2xl border border-border p-3 bg-secondary/30">
          <p className="text-muted-foreground text-[11px]">Current Mode</p>
          <p className="font-bold text-foreground capitalize mt-0.5">
            {!settings || settings.manual_mode === "auto"
              ? "Auto Operating Hours (9:00 AM)"
              : settings.manual_mode === "online"
              ? "Manual Override: ONLINE"
              : "Manual Override: OFFLINE"}
          </p>
        </div>
        <div className="rounded-2xl border border-border p-3 bg-secondary/30">
          <p className="text-muted-foreground text-[11px]">Opening Hours</p>
          <p className="font-bold text-foreground mt-0.5">9:00 AM - 11:59 PM</p>
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
      <div className="pt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => handleModeChange("online")}
          className={cn(
            "flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition-all cursor-pointer border",
            settings?.manual_mode === "online"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
          )}
        >
          <Power className="size-3.5" />
          <span>Set Store Online</span>
        </button>

        <button
          type="button"
          disabled={isUpdating}
          onClick={() => handleModeChange("offline")}
          className={cn(
            "flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition-all cursor-pointer border",
            settings?.manual_mode === "offline"
              ? "bg-destructive text-destructive-foreground border-destructive shadow-sm"
              : "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
          )}
        >
          <Power className="size-3.5" />
          <span>Set Store Offline</span>
        </button>

        <button
          type="button"
          disabled={isUpdating}
          onClick={() => handleModeChange("auto")}
          className={cn(
            "flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition-all cursor-pointer border",
            !settings || settings.manual_mode === "auto"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-secondary text-secondary-foreground border-border hover:bg-muted"
          )}
        >
          <Clock className="size-3.5" />
          <span>Auto Schedule (9:00 AM)</span>
        </button>
      </div>
    </div>
  );
}
