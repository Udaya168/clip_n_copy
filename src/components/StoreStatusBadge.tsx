import { useStoreStatus } from "@/lib/store-status";
import { Clock, Store, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreStatusBadgeProps {
  className?: string;
  showIcon?: boolean;
}

export function StoreStatusBadge({ className, showIcon = true }: StoreStatusBadgeProps) {
  const { isOnline, statusLabel, statusBadge } = useStoreStatus();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all select-none",
        isOnline
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          : statusBadge === "before_opening"
          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
          : "bg-destructive/10 text-destructive border border-destructive/20",
        className
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

      {showIcon && (
        isOnline ? (
          <Store className="size-3.5 shrink-0" />
        ) : statusBadge === "before_opening" ? (
          <Clock className="size-3.5 shrink-0" />
        ) : (
          <ShieldAlert className="size-3.5 shrink-0" />
        )
      )}

      <span>{statusLabel}</span>
    </div>
  );
}
