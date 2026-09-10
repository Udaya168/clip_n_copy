import { useState, useEffect } from "react";
import { useStoreStatus, formatReopenDate } from "@/lib/store-status";
import { Store, Calendar, Clock, AlertCircle, X, Loader2, CheckCircle2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AdminSettingsStoreStatusCard() {
  const {
    settings,
    isOnline,
    storeStatus,
    closureType,
    reopenAtFormatted,
    closureMessage,
    updateClosureSettings,
    refresh,
  } = useStoreStatus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingDirectOpen, setIsSavingDirectOpen] = useState(false);

  const isTempClosed = !isOnline && (storeStatus === "temporarily_closed" || closureType === "temporary");
  const isIndefiniteClosed = !isOnline && !isTempClosed;

  const handleOpenStoreNow = async () => {
    if (isSavingDirectOpen) return;
    setIsSavingDirectOpen(true);
    try {
      await updateClosureSettings({
        store_status: "open",
        closure_type: null,
        reopen_at: null,
        closure_message: null,
        auto_reopen: true,
      });
      toast.success("Store is now OPEN and accepting new orders.");
      refresh();
    } catch (err) {
      toast.error("Failed to open store. Please try again.");
    } finally {
      setIsSavingDirectOpen(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-background p-6 shadow-soft space-y-5">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-start gap-3.5">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary mt-0.5">
            <Store className="size-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Store Status</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your store availability and schedule when the store should reopen.
            </p>
          </div>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-black uppercase tracking-wider select-none",
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
            {isOnline
              ? "Store Open"
              : isTempClosed
              ? "Store Temporarily Closed"
              : "Store Closed"}
          </span>
        </div>
      </div>

      {/* Main Status Information Body */}
      {isOnline ? (
        <div className="space-y-4">
          <div className="text-sm font-semibold text-foreground">
            Current Status: <span className="font-bold text-emerald-600 dark:text-emerald-400">🟢 Store Open</span>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs">
            <p className="font-bold text-emerald-950 dark:text-emerald-200">Accepting new orders</p>
            <p className="text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
              Your store is active online. Customers can add items to cart and place new orders.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Calendar className="size-4" /> Change Store Status
          </button>
        </div>
      ) : isTempClosed ? (
        <div className="space-y-4">
          <div className="text-sm font-semibold text-foreground">
            Current Status: <span className="font-bold text-destructive">🔴 Store Temporarily Closed</span>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/30 p-4 space-y-2 text-xs">
            <p className="font-bold text-amber-950 dark:text-amber-100 text-sm">
              🔴 Store Temporarily Closed
            </p>
            <p className="text-amber-900/90 dark:text-amber-200 font-medium">
              Orders are currently disabled.
            </p>

            {reopenAtFormatted && (
              <div className="pt-2 border-t border-amber-500/20 space-y-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900/70 dark:text-amber-300/70">
                  Reopens:
                </p>
                <div className="flex items-center gap-1.5 text-sm font-black text-amber-950 dark:text-amber-100">
                  <Clock className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{reopenAtFormatted}</span>
                </div>
              </div>
            )}

            {closureMessage && (
              <div className="mt-2 rounded-xl bg-background/80 p-2.5 border border-amber-500/20 text-[12px] text-foreground">
                <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Message to Customers:</p>
                <p className="italic mt-0.5">"{closureMessage}"</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Calendar className="size-4 text-primary" /> Edit Schedule
            </button>

            <button
              type="button"
              disabled={isSavingDirectOpen}
              onClick={handleOpenStoreNow}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSavingDirectOpen ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Open Store Now
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm font-semibold text-foreground">
            Current Status: <span className="font-bold text-destructive">🔴 Store Closed</span>
          </div>

          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 space-y-1 text-xs">
            <p className="font-bold text-destructive text-sm">🔴 Store Closed</p>
            <p className="text-foreground/90 font-medium">
              This store will remain closed until you manually open it.
            </p>
            {closureMessage && (
              <div className="mt-2 rounded-xl bg-background/80 p-2.5 border border-destructive/20 text-[12px] text-foreground">
                <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Message to Customers:</p>
                <p className="italic mt-0.5">"{closureMessage}"</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Calendar className="size-4 text-primary" /> Change Store Status
            </button>

            <button
              type="button"
              disabled={isSavingDirectOpen}
              onClick={handleOpenStoreNow}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSavingDirectOpen ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Open Store Now
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <StoreStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSettings={settings}
        onSaveSuccess={() => {
          setIsModalOpen(false);
          refresh();
        }}
      />
    </div>
  );
}

interface StoreStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSettings?: any;
  onSaveSuccess: () => void;
}

function StoreStatusModal({
  isOpen,
  onClose,
  initialSettings,
  onSaveSuccess,
}: StoreStatusModalProps) {
  const { updateClosureSettings } = useStoreStatus();

  // Top level 3 choices: "open" | "temporary" | "indefinite"
  const [selectedOption, setSelectedOption] = useState<"open" | "temporary" | "indefinite">("temporary");

  // Reopen Date & Time
  const tomorrow = new Date(Date.now() + 86400000);
  const defaultDateStr = tomorrow.toISOString().split("T")[0] || "2026-09-18";

  const [reopenDate, setReopenDate] = useState<string>(defaultDateStr);
  const [reopenTime, setReopenTime] = useState<string>("09:00");
  const [closureMessage, setClosureMessage] = useState<string>("");
  const [autoReopen, setAutoReopen] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    // Scroll lock
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Set default option based on current settings
    if (initialSettings?.store_status === "open" || initialSettings?.is_online) {
      setSelectedOption("temporary");
    } else if (initialSettings?.store_status === "temporarily_closed" || initialSettings?.closure_type === "temporary") {
      setSelectedOption("temporary");
    } else if (initialSettings?.store_status === "closed" || initialSettings?.closure_type === "indefinite") {
      setSelectedOption("indefinite");
    } else {
      setSelectedOption("temporary");
    }

    if (initialSettings?.reopen_at) {
      try {
        const d = new Date(initialSettings.reopen_at);
        if (!isNaN(d.getTime())) {
          const dateStr = d.toISOString().split("T")[0];
          const hh = d.getHours().toString().padStart(2, "0");
          const mm = d.getMinutes().toString().padStart(2, "0");
          if (dateStr) setReopenDate(dateStr);
          setReopenTime(`${hh}:${mm}`);
        }
      } catch {
        // fallback
      }
    }

    if (initialSettings?.closure_message) {
      setClosureMessage(initialSettings.closure_message);
    }
    setAutoReopen(initialSettings?.auto_reopen ?? true);

    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. OPEN STORE
    if (selectedOption === "open") {
      setIsSubmitting(true);
      try {
        await updateClosureSettings({
          store_status: "open",
          closure_type: null,
          reopen_at: null,
          closure_message: null,
          auto_reopen: true,
        });
        toast.success("Store is now OPEN and accepting new orders.");
        onSaveSuccess();
      } catch (err) {
        toast.error("Failed to open store.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 2. CLOSE TEMPORARILY
    if (selectedOption === "temporary") {
      if (!reopenDate || !reopenTime) {
        setValidationError("Please select both a valid reopen date and time.");
        return;
      }

      const scheduledDateTime = new Date(`${reopenDate}T${reopenTime}`);
      if (isNaN(scheduledDateTime.getTime())) {
        setValidationError("Please enter a valid date and time.");
        return;
      }

      if (scheduledDateTime.getTime() <= Date.now()) {
        setValidationError("Reopen date and time cannot be in the past.");
        return;
      }

      setIsSubmitting(true);
      try {
        await updateClosureSettings({
          store_status: "temporarily_closed",
          closure_type: "temporary",
          reopen_at: scheduledDateTime.toISOString(),
          closure_message: closureMessage.trim() || null,
          auto_reopen: autoReopen,
        });
        toast.success("Store scheduled for temporary closure.");
        onSaveSuccess();
      } catch (err) {
        toast.error("Failed to save temporary closure schedule.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 3. CLOSE INDEFINITELY
    if (selectedOption === "indefinite") {
      setIsSubmitting(true);
      try {
        await updateClosureSettings({
          store_status: "closed",
          closure_type: "indefinite",
          reopen_at: null,
          closure_message: closureMessage.trim() || null,
          auto_reopen: false,
        });
        toast.success("Store is now closed indefinitely.");
        onSaveSuccess();
      } catch (err) {
        toast.error("Failed to close store.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
  };

  // Preview formatted string for temporary closure
  let formattedPreview = "";
  if (reopenDate && reopenTime) {
    formattedPreview = formatReopenDate(`${reopenDate}T${reopenTime}`);
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-6 space-y-5 my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-2 text-foreground font-display text-lg font-bold">
            <Store className="size-5 text-primary" />
            <span>Store Status</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Three Options List */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Select Store Status
            </label>

            <div className="space-y-2.5">
              {/* Option 1: Open Store */}
              <label
                className={cn(
                  "p-4 rounded-2xl border text-xs transition-all cursor-pointer flex items-start gap-3 select-none",
                  selectedOption === "open"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20"
                    : "border-border bg-secondary/40 text-foreground hover:bg-secondary"
                )}
              >
                <input
                  type="radio"
                  name="selectedOption"
                  value="open"
                  checked={selectedOption === "open"}
                  onChange={() => {
                    setSelectedOption("open");
                    setValidationError(null);
                  }}
                  className="mt-0.5 size-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                />
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-1.5">
                    🟢 Open Store
                  </div>
                  <p className="text-muted-foreground dark:text-emerald-300/80 text-[11px] mt-0.5 font-medium">
                    Immediately set the store status to OPEN and accept new orders.
                  </p>
                </div>
              </label>

              {/* Option 2: Close Temporarily */}
              <label
                className={cn(
                  "p-4 rounded-2xl border text-xs transition-all cursor-pointer flex items-start gap-3 select-none",
                  selectedOption === "temporary"
                    ? "border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-100 ring-2 ring-amber-500/20"
                    : "border-border bg-secondary/40 text-foreground hover:bg-secondary"
                )}
              >
                <input
                  type="radio"
                  name="selectedOption"
                  value="temporary"
                  checked={selectedOption === "temporary"}
                  onChange={() => {
                    setSelectedOption("temporary");
                    setValidationError(null);
                  }}
                  className="mt-0.5 size-4 text-amber-600 accent-amber-600 cursor-pointer"
                />
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-1.5">
                    🔴 Close Temporarily
                  </div>
                  <p className="text-muted-foreground dark:text-amber-200/80 text-[11px] mt-0.5 font-medium">
                    Schedule a temporary closure with automatic reopening date & time.
                  </p>
                </div>
              </label>

              {/* Option 3: Close Indefinitely */}
              <label
                className={cn(
                  "p-4 rounded-2xl border text-xs transition-all cursor-pointer flex items-start gap-3 select-none",
                  selectedOption === "indefinite"
                    ? "border-destructive bg-destructive/10 text-destructive ring-2 ring-destructive/20"
                    : "border-border bg-secondary/40 text-foreground hover:bg-secondary"
                )}
              >
                <input
                  type="radio"
                  name="selectedOption"
                  value="indefinite"
                  checked={selectedOption === "indefinite"}
                  onChange={() => {
                    setSelectedOption("indefinite");
                    setValidationError(null);
                  }}
                  className="mt-0.5 size-4 text-destructive accent-destructive cursor-pointer"
                />
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-1.5">
                    🔴 Close Indefinitely
                  </div>
                  <p className="text-muted-foreground dark:text-destructive/80 text-[11px] mt-0.5 font-medium">
                    Keep store closed manually until you choose to open it again.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* CHOICE CONTENT FIELDS */}

          {/* 1. Open Store Content */}
          {selectedOption === "open" && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
              <p className="font-bold text-sm">Open Store Immediately</p>
              <p className="opacity-90">
                Your store will immediately start accepting new orders from customers.
              </p>
            </div>
          )}

          {/* 2. Close Temporarily Content */}
          {selectedOption === "temporary" && (
            <div className="space-y-4">
              <div className="space-y-3 p-4 rounded-2xl bg-secondary/40 border border-border">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      Reopen Date
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={reopenDate}
                      onChange={(e) => {
                        setReopenDate(e.target.value);
                        setValidationError(null);
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      Reopen Time
                    </label>
                    <input
                      type="time"
                      required
                      value={reopenTime}
                      onChange={(e) => {
                        setReopenTime(e.target.value);
                        setValidationError(null);
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Example / Preview calculation */}
                {formattedPreview && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 dark:text-amber-100 font-medium">
                    <span className="opacity-80">Close now → Reopen on </span>
                    <strong className="font-black text-amber-950 dark:text-amber-100">{formattedPreview}</strong>.
                  </div>
                )}

                {/* AUTO REOPEN CHECKBOX */}
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoReopen}
                    onChange={(e) => setAutoReopen(e.target.checked)}
                    className="size-4 rounded border-input text-primary accent-primary cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Automatically reopen
                  </span>
                </label>
              </div>

              {/* OPTIONAL CUSTOMER MESSAGE */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-primary" /> Optional message to customers
                </label>
                <textarea
                  rows={2}
                  value={closureMessage}
                  onChange={(e) => setClosureMessage(e.target.value)}
                  placeholder="e.g. Store is temporarily closed. We will reopen soon."
                  className="w-full rounded-2xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground resize-none"
                />
              </div>
            </div>
          )}

          {/* 3. Close Indefinitely Content */}
          {selectedOption === "indefinite" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-1">
                <p className="font-bold text-sm">Close Store Indefinitely</p>
                <p className="text-foreground/90 font-medium">
                  This store will remain closed until you manually open it.
                </p>
              </div>

              {/* OPTIONAL CUSTOMER MESSAGE */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-primary" /> Optional message to customers
                </label>
                <textarea
                  rows={2}
                  value={closureMessage}
                  onChange={(e) => setClosureMessage(e.target.value)}
                  placeholder="e.g. Store is currently closed for maintenance."
                  className="w-full rounded-2xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground resize-none"
                />
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50",
                selectedOption === "open"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : selectedOption === "temporary"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving...
                </>
              ) : selectedOption === "open" ? (
                "Open Store"
              ) : selectedOption === "temporary" ? (
                "Save Schedule"
              ) : (
                "Close Store"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

