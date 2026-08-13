import { CheckCircle2, Circle, Clock, PackageCheck, Truck, Check, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderStatus = "processing" | "confirmed" | "shipped" | "delivered" | "cancelled";

interface OrderStatusTimelineProps {
  status: OrderStatus;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
}

const STEPS = [
  { id: "placed", label: "Order Placed", icon: CheckCircle2 },
  { id: "processing", label: "Processing", icon: Clock },
  { id: "confirmed", label: "Confirmed", icon: PackageCheck },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: Check },
];

export function OrderStatusTimeline({ status, createdAt }: OrderStatusTimelineProps) {
  // If order is cancelled
  if (status === "cancelled") {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-destructive/15 text-destructive shrink-0">
            <XCircle className="size-6" />
          </div>
          <div>
            <h4 className="font-display font-bold text-destructive text-sm sm:text-base">Order Cancelled</h4>
            <p className="text-xs text-muted-foreground">This order has been cancelled by the shop administrator.</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-destructive/10 text-xs">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold">
            <CheckCircle2 className="size-4 shrink-0" /> Order Placed ({createdAt ? new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Done"})
          </div>
          <div className="flex items-center gap-2 text-destructive font-bold">
            <XCircle className="size-4 shrink-0" /> Cancelled
          </div>
        </div>
      </div>
    );
  }

  // Get index of current active step
  const currentStepIndex =
    status === "processing"
      ? 1
      : status === "confirmed"
        ? 2
        : status === "shipped"
          ? 3
          : status === "delivered"
            ? 4
            : 1;

  return (
    <div className="rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-xs">
      <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-4">
        Order Status Timeline
      </h4>

      <div className="relative flex items-center justify-between">
        {/* Connecting Line */}
        <div className="absolute left-4 right-4 top-4 h-0.5 bg-border -z-0" />
        <div
          className="absolute left-4 top-4 h-0.5 bg-primary transition-all duration-500 -z-0"
          style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {/* Timeline Steps */}
        {STEPS.map((step, idx) => {
          const isDone = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  "grid size-8 sm:size-9 place-items-center rounded-full border-2 transition-all",
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground shadow-glow scale-110"
                    : isDone
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                )}
              >
                {isDone ? <StepIcon className="size-4 sm:size-4.5" /> : <Circle className="size-3 text-muted-foreground/40" />}
              </div>

              <span
                className={cn(
                  "mt-2 text-[10px] sm:text-xs font-bold text-center leading-tight max-w-[4.5rem]",
                  isCurrent
                    ? "text-primary font-black"
                    : isDone
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground/60 font-medium"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
