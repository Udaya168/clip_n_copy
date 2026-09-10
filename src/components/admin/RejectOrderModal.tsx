import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XCircle, Loader2, AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RejectOrderModalProps {
  orderId: string | null;
  orderNumber: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (reason: string) => Promise<void>;
}

const DEFAULT_OPTION = "Item out of stock / unavailable";

const REJECTION_OPTIONS = [
  DEFAULT_OPTION,
  "Store currently busy / unable to fulfill",
  "Custom Reason",
];

export function RejectOrderModal({
  orderId,
  orderNumber,
  isOpen,
  onClose,
  onConfirmReject,
}: RejectOrderModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>(DEFAULT_OPTION);
  const [customReason, setCustomReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!orderId || !orderNumber) return null;

  const isCustom = selectedOption === "Custom Reason";
  const isValid = !isCustom || customReason.trim().length > 0;

  const handleConfirm = async () => {
    if (!isValid || isSubmitting) return;

    const finalReason = isCustom ? customReason.trim() : selectedOption;
    setIsSubmitting(true);
    try {
      await onConfirmReject(finalReason);
      setCustomReason("");
      setSelectedOption(DEFAULT_OPTION);
      onClose();
    } catch (err) {
      console.error("[RejectOrderModal error]", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md w-full rounded-3xl p-6 border border-border bg-background shadow-2xl space-y-5">
        <div>
          <div className="flex items-center gap-2 text-destructive font-display text-lg font-black">
            <AlertTriangle className="size-5 shrink-0" />
            <DialogTitle className="text-lg font-black text-foreground">
              Reject Order #{orderNumber}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Select a reason for rejecting this order. An automatic rejection email will be sent to the customer.
          </DialogDescription>
        </div>

        {/* 3 Rejection Options */}
        <div className="space-y-2.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Select Rejection Reason:
          </label>
          <div className="space-y-2">
            {REJECTION_OPTIONS.map((option) => {
              const isSelected = selectedOption === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedOption(option)}
                  className={cn(
                    "w-full flex items-center justify-between p-3.5 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer",
                    isSelected
                      ? "border-destructive bg-destructive/10 text-destructive ring-1 ring-destructive/30"
                      : "border-border bg-card text-foreground hover:bg-secondary/60"
                  )}
                >
                  <span>{option}</span>
                  <div
                    className={cn(
                      "size-4 rounded-full border flex items-center justify-center shrink-0 ml-2",
                      isSelected
                        ? "border-destructive bg-destructive text-destructive-foreground"
                        : "border-muted-foreground/40"
                    )}
                  >
                    {isSelected && <Check className="size-2.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Reason Textarea */}
        {isCustom && (
          <div className="space-y-1.5 animate-in fade-in-50 duration-200">
            <label className="text-xs font-bold text-foreground">
              Enter Custom Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={3}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Explain why the order is being rejected..."
              className="w-full rounded-2xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:ring-2 focus:ring-destructive focus:outline-none placeholder:text-muted-foreground resize-none"
            />
            {isCustom && customReason.trim().length === 0 && (
              <p className="text-[11px] font-semibold text-destructive">
                Custom reason is required before submitting.
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl text-xs font-bold px-4 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid || isSubmitting}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-bold px-5 gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Rejecting...
              </>
            ) : (
              <>
                <XCircle className="size-3.5" /> Confirm Rejection
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
