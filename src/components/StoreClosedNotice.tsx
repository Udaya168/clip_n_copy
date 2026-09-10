import { useStoreStatus } from "@/lib/store-status";
import { ShieldAlert, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreClosedNoticeProps {
  className?: string;
  compact?: boolean;
}

export function StoreClosedNotice({ className, compact = false }: StoreClosedNoticeProps) {
  const { isOnline, storeStatus, closureType, reopenAtFormatted, closureMessage } = useStoreStatus();

  if (isOnline) return null;

  const isTemp = storeStatus === "temporarily_closed" || closureType === "temporary";

  if (compact) {
    return (
      <div className={cn("rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-start gap-2.5 shadow-sm", className)}>
        <ShieldAlert className="size-4 shrink-0 mt-0.5" />
        <div className="space-y-1 min-w-0 flex-1">
          <p className="font-bold text-sm">
            {isTemp ? "Store Temporarily Closed" : "Store Currently Closed"}
          </p>
          <p className="opacity-90">
            {isTemp ? "We’re currently not accepting new orders." : "We’re not accepting new orders at the moment. Please check back later."}
          </p>
          {isTemp && reopenAtFormatted && (
            <p className="font-semibold text-foreground/90 mt-1 flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0 text-amber-500" />
              <span>Reopens on <strong className="font-bold">{reopenAtFormatted}</strong></span>
            </p>
          )}
          {closureMessage && (
            <div className="mt-2 rounded-xl bg-background/80 p-2.5 border border-destructive/20 text-[12px] text-foreground">
              <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Note from shop:</p>
              <p className="italic mt-0.5">"{closureMessage}"</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-3xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/30 p-5 shadow-soft", className)}>
      <div className="flex items-start gap-3.5">
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
          <ShieldAlert className="size-5" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-display text-base font-bold text-amber-950 dark:text-amber-100">
            {isTemp ? "Store Temporarily Closed" : "Store Currently Closed"}
          </h3>
          <p className="text-xs text-amber-900/90 dark:text-amber-200 font-medium">
            {isTemp
              ? "We’re currently not accepting new orders."
              : "We’re not accepting new orders at the moment. Please check back later."}
          </p>

          {isTemp && reopenAtFormatted && (
            <div className="mt-2.5 inline-flex items-center gap-2 rounded-xl bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-950 dark:text-amber-100 border border-amber-500/30">
              <Clock className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Reopens on <strong className="font-black">{reopenAtFormatted}</strong></span>
            </div>
          )}

          {closureMessage && (
            <div className="mt-3 rounded-2xl bg-background/80 p-3 border border-amber-500/20 text-xs text-foreground flex items-start gap-2.5">
              <Info className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Message from Shop Owner</p>
                <p className="mt-0.5 font-medium italic">"{closureMessage}"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
