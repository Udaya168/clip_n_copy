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
    <div className="flex flex-col">
      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">
        Order Status
      </h4>

      <div className="relative flex items-start justify-between">
        {/* Connecting Line */}
        <div className="absolute left-[5%] right-[5%] top-4 h-[2px] bg-secondary -z-0 rounded-full" />
        <div
          className="absolute left-[5%] top-4 h-[2px] bg-primary transition-all duration-500 -z-0 rounded-full"
          style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 90}%` }}
        />

        {/* Timeline Steps */}
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center w-16 sm:w-20">
              <div
                className={cn(
                  "grid size-8 place-items-center rounded-full border-2 transition-all bg-background",
                  isCurrent
                    ? "border-primary text-primary shadow-[0_0_0_4px_rgba(59,130,246,0.1)] scale-110"
                    : isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground/30"
                )}
              >
                {isCompleted ? (
                  <Check className="size-4 text-primary-foreground" strokeWidth={3} />
                ) : isCurrent ? (
                  <step.icon className="size-4" />
                ) : (
                  <Circle className="size-2.5 text-muted-foreground/20" />
                )}
              </div>

              <span
                className={cn(
                  "mt-3 text-[10px] sm:text-xs font-medium text-center leading-tight break-words",
                  isCurrent
                    ? "text-primary font-bold"
                    : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground/50"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center text-sm font-medium text-muted-foreground bg-secondary/30 rounded-xl py-3 px-4">
        {status === "processing" && "Your order is currently being processed."}
        {status === "confirmed" && "Your order has been confirmed and is being prepared."}
        {status === "shipped" && "Your order has been shipped and is on its way."}
        {status === "delivered" && "Your order has been delivered successfully."}
      </div>
    </div>
  );
}
