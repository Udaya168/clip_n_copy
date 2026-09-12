import React, { useRef, useState, useEffect } from "react";
import { CheckCircle2, FileUp, X, Loader2, FileText, Phone, AlertCircle, Sparkles, Layers } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { submitCustomizationRequest } from "@/lib/customization-request-service";
import { useAuth } from "@/lib/auth-store";

export type CustomizationTypeOption = "Brochure" | "Banner" | "ID Card" | "Magazine";

const CUSTOMIZATION_TYPES: CustomizationTypeOption[] = ["Brochure", "Banner", "ID Card", "Magazine"];

export function UploadCustomizationModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const { user } = useAuth();

  // Background scroll locking
  useEffect(() => {
    const savedScrollY = window.scrollY;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalHtmlOverflowX = document.documentElement.style.overflowX;
    const originalHtmlOverflowY = document.documentElement.style.overflowY;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyOverflowX = document.body.style.overflowX;
    const originalBodyOverflowY = document.body.style.overflowY;

    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overflowX = "hidden";
    document.documentElement.style.overflowY = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "hidden";

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest(".modal-scroll-body")) {
        e.preventDefault();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest(".modal-scroll-body")) {
        e.preventDefault();
      }
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.documentElement.style.overflowX = originalHtmlOverflowX;
      document.documentElement.style.overflowY = originalHtmlOverflowY;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.overflowX = originalBodyOverflowX;
      document.body.style.overflowY = originalBodyOverflowY;

      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("wheel", handleWheel);

      window.scrollTo(0, savedScrollY);
    };
  }, []);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customizationType, setCustomizationType] = useState<CustomizationTypeOption>("Brochure");
  const [title, setTitle] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [phone, setPhone] = useState<string>("");

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setValidationError(null);

    // Reject video files explicitly
    if (file.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm|wmv|flv)$/i.test(file.name)) {
      setFileError("Video files are not supported. Please select a document or image file.");
      setSelectedFile(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate limit (25 MB)
    if (file.size > 25 * 1024 * 1024) {
      setFileError("File size exceeds 25 MB limit.");
      setSelectedFile(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
  };

  // Form Validation
  const validateForm = (): boolean => {
    setValidationError(null);

    if (!selectedFile) {
      setValidationError("Please upload your preference file before continuing.");
      return false;
    }

    if (!customizationType) {
      setValidationError("Please select a type of customization.");
      return false;
    }

    if (!title || !title.trim()) {
      setValidationError("Please enter a title for your customization.");
      return false;
    }

    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum < 1 || quantity.includes(".")) {
      setValidationError("Please enter a valid quantity (minimum 1 positive whole number).");
      return false;
    }

    const cleanPhone = phone.trim();
    const phoneDigits = cleanPhone.replace(/\D/g, "");
    if (!cleanPhone || phoneDigits.length < 10) {
      setValidationError("Please enter a valid 10-digit phone number.");
      return false;
    }

    return true;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    const qtyNum = parseInt(quantity, 10);

    const result = await submitCustomizationRequest({
      selectedFile: selectedFile!,
      customizationType,
      title: title.trim(),
      quantity: qtyNum,
      phone: phone.trim(),
      customerEmail: user?.email || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setRequestId(result.requestId || null);
      setDone(true);
      toast.success("Customization request submitted successfully! ✨");
    } else {
      console.error("[UploadCustomizationModal] Submit error:", result.error);
      setValidationError(result.error || "Failed to submit customization request.");
      toast.error(result.error || "Failed to submit customization request. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-hidden w-screen h-dvh">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Outer Container */}
      <div className="relative z-[101] flex flex-col w-[min(100%-24px,760px)] max-h-[94dvh] sm:max-h-[92dvh] rounded-2xl sm:rounded-3xl border border-border/40 bg-background shadow-2xl overflow-hidden rise-in min-w-0 overscroll-contain">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="grid size-9 sm:size-10 shrink-0 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
              <Sparkles className="size-4.5 sm:size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">Customization Printing</h3>
              <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">Upload your requirements and tell us what you need.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer ml-2"
            aria-label="Close"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Primary Vertical Scrollable Body */}
        <div className="modal-scroll-body flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-5 sm:space-y-6 [-webkit-overflow-scrolling:touch] overscroll-contain">
          {done ? (
            /* Success View */
            <div className="space-y-6 py-6 text-center flex flex-col items-center justify-center min-h-[340px] min-w-0">
              <div className="rounded-full bg-purple-500/10 p-4 border border-purple-500/20 shrink-0">
                <CheckCircle2 className="size-12 text-purple-600 animate-bounce" />
              </div>
              <div className="space-y-2 min-w-0 px-2">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">Customization request submitted successfully!</h3>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground max-w-md mx-auto leading-relaxed break-words">
                  Your request has been sent to the shop owner. They will contact you regarding your customization.
                </p>
              </div>

              {/* Summary Card */}
              <div className="w-full max-w-md rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5 text-left space-y-3 text-xs min-w-0">
                <div className="font-bold text-xs sm:text-sm text-foreground border-b border-border/40 pb-2 flex justify-between items-center gap-2">
                  <span className="truncate uppercase font-display text-purple-600">Customization Request Summary</span>
                  {requestId && <span className="text-[10px] bg-purple-500/10 text-purple-700 px-2 py-0.5 rounded-full font-mono">#{requestId.slice(0, 8)}</span>}
                </div>
                <div className="space-y-1.5 text-muted-foreground">
                  <div className="flex justify-between gap-2">
                    <span>Customization Type:</span>
                    <span className="font-bold text-foreground truncate">{customizationType}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Title / Details:</span>
                    <span className="font-bold text-foreground truncate">{title}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Quantity:</span>
                    <span className="font-bold text-foreground">{quantity}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Uploaded Preference:</span>
                    <span className="font-bold text-foreground truncate">{fileName}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Contact Phone:</span>
                    <span className="font-bold text-foreground">+91 {phone}</span>
                  </div>
                </div>
              </div>

              <Button onClick={onClose} className="rounded-full px-8 h-11 font-bold shrink-0">
                Done &amp; Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Validation Alert */}
              {validationError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive flex items-start gap-2.5 min-w-0">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span className="break-words flex-1">{validationError}</span>
                </div>
              )}

              {/* SECTION 1: UPLOAD YOUR PREFERENCE */}
              <div className="space-y-2.5 min-w-0">
                <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileUp className="size-3.5 text-purple-600" />
                  SECTION 1 — Upload Your Preference <span className="text-destructive">*</span>
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-6 sm:p-8 text-center transition-all hover:border-purple-500/60 hover:bg-purple-500/5 cursor-pointer min-w-0"
                  >
                    <div className="grid size-12 place-items-center rounded-2xl bg-purple-500/10 text-purple-600 transition-transform group-hover:scale-110 mb-3">
                      <FileUp className="size-6" />
                    </div>
                    <p className="text-sm font-bold text-foreground">Click to upload your preference file</p>
                    <p className="text-xs font-medium text-muted-foreground mt-1">PDF, DOC, DOCX, JPG, PNG or WebP (Max 25MB)</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4 min-w-0 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
                        <FileText className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-foreground truncate">{fileName}</p>
                        <p className="text-[11px] font-medium text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setFileName(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                    >
                      Change
                    </Button>
                  </div>
                )}
                {fileError && <p className="text-xs font-medium text-destructive mt-1">{fileError}</p>}
              </div>

              {/* SECTION 2: TYPE OF CUSTOMIZATION */}
              <div className="space-y-2.5 min-w-0">
                <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="size-3.5 text-purple-600" />
                  SECTION 2 — Type of Customization <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 min-w-0">
                  {CUSTOMIZATION_TYPES.map((t) => {
                    const isSelected = customizationType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setCustomizationType(t)}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer min-w-0 ${
                          isSelected
                            ? "border-purple-600 bg-purple-500/10 text-purple-900 font-bold shadow-sm ring-1 ring-purple-600/30"
                            : "border-border/60 bg-card hover:border-purple-500/40 text-foreground font-semibold"
                        }`}
                      >
                        <span className="text-xs sm:text-sm truncate">{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: TITLE */}
              <div className="space-y-2 min-w-0">
                <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  SECTION 3 — Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter the title for your customization"
                  className="w-full h-11 rounded-xl border border-border/80 bg-background px-4 text-xs sm:text-sm font-medium focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-foreground"
                />
              </div>

              {/* SECTION 4: QUANTITY */}
              <div className="space-y-2 min-w-0">
                <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  SECTION 4 — Quantity <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^[1-9]\d*$/.test(val)) {
                      setQuantity(val);
                    }
                  }}
                  placeholder="Enter quantity"
                  className="w-full h-11 rounded-xl border border-border/80 bg-background px-4 text-xs sm:text-sm font-medium focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-foreground"
                />
              </div>

              {/* SECTION 5: PHONE NUMBER */}
              <div className="space-y-2 min-w-0">
                <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Phone className="size-3.5 text-purple-600" />
                  SECTION 5 — Phone Number <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-11 items-center justify-center rounded-xl border border-border/80 bg-muted/40 px-3.5 text-xs sm:text-sm font-bold text-muted-foreground shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter 10-digit phone number"
                    className="w-full h-11 rounded-xl border border-border/80 bg-background px-4 text-xs sm:text-sm font-medium focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-foreground"
                  />
                </div>
                <p className="text-[11px] font-medium text-muted-foreground">
                  📞 The shop owner will contact you regarding customization details.
                </p>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="border-t border-border/50 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-full font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all text-sm sm:text-base cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" /> Submitting Request...
                    </span>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
