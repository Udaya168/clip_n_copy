import React, { useRef, useState, useEffect } from "react";
import { CheckCircle2, FileUp, X, Loader2, FileText, Phone, AlertCircle, Copy, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitPrintRequest } from "@/lib/print-request-service";
import { useAuth } from "@/lib/auth-store";

// Client-side PDF page count detector
async function detectPdfPageCount(file: File): Promise<number | null> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return null;
  }
  try {
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder("latin1").decode(arrayBuffer);
    
    // Look for /Count X in catalog
    const countMatches = text.match(/\/Count\s+(\d+)/g);
    if (countMatches && countMatches.length > 0) {
      const counts = countMatches.map((m) => parseInt(m.replace(/\/Count\s+/, ""), 10));
      const maxCount = Math.max(...counts);
      if (maxCount > 0 && maxCount < 10000) return maxCount;
    }

    // Count /Type /Page
    const pageMatches = text.match(/\/Type\s*\/Page\b/g);
    if (pageMatches && pageMatches.length > 0) {
      return pageMatches.length;
    }
  } catch (e) {
    console.warn("Failed to parse PDF page count", e);
  }
  return null;
}

// Page range parser utility
function parsePageRanges(rangeStr: string, totalPages: number | null): { pages: Set<number>; error: string | null } {
  const pages = new Set<number>();
  const trimmed = rangeStr.trim();
  if (!trimmed) {
    return { pages, error: "Page range cannot be empty." };
  }

  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { pages, error: "Please enter valid page numbers or ranges." };
  }

  for (const part of parts) {
    if (part.includes("-")) {
      const split = part.split("-").map((s) => s.trim());
      if (split.length !== 2) {
        return { pages, error: `Invalid range format: "${part}"` };
      }
      const first = split[0] ?? "";
      const second = split[1] ?? "";
      const start = parseInt(first, 10);
      const end = parseInt(second, 10);

      if (isNaN(start) || isNaN(end)) {
        return { pages, error: `Invalid numbers in range "${part}".` };
      }
      if (start < 1 || end < 1) {
        return { pages, error: `Page numbers must be 1 or greater.` };
      }
      if (start > end) {
        return { pages, error: `Invalid range "${part}": start page (${start}) cannot be greater than end page (${end}).` };
      }
      if (totalPages !== null && (start > totalPages || end > totalPages)) {
        return { pages, error: `Page numbers in "${part}" exceed total page count (${totalPages}).` };
      }
      for (let i = start; i <= end; i++) {
        pages.add(i);
      }
    } else {
      const page = parseInt(part, 10);
      if (isNaN(page)) {
        return { pages, error: `Invalid page number: "${part}".` };
      }
      if (page < 1) {
        return { pages, error: `Page numbers must be 1 or greater.` };
      }
      if (totalPages !== null && page > totalPages) {
        return { pages, error: `Page number ${page} exceeds total page count (${totalPages}).` };
      }
      pages.add(page);
    }
  }

  return { pages, error: null };
}

type PrintType = "Black & White" | "Color" | "B&W + Color";
type PrintSide = "Single Side" | "Back to Back";
type MediaOption = "Plain Paper" | "Bond Paper" | "Glass Paper" | "Flex" | "Sticker Vinyl";
type BindingOption = "No Binding" | "Spiral Binding" | "Soft Binding" | "Hard Binding";

const SINGLE_SIDE_SIZES = ["A/5", "A/4", "A/3", "A/2", "A/1", "A/0"];
const BACK_TO_BACK_SIZES = ["A/5", "A/4", "A/3"];
const MEDIA_OPTIONS: MediaOption[] = ["Plain Paper", "Bond Paper", "Glass Paper", "Flex", "Sticker Vinyl"];
const BINDING_OPTIONS: BindingOption[] = ["No Binding", "Spiral Binding", "Soft Binding", "Hard Binding"];

export function UploadPrintModal({
  onClose,
  serviceName,
}: {
  onClose: () => void;
  serviceName?: string | null;
}) {
  // Lock background scrolling while modal is open & restore saved scroll position upon closing/unmounting
  useEffect(() => {
    const savedScrollY = window.scrollY;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalHtmlOverflowX = document.documentElement.style.overflowX;
    const originalHtmlOverflowY = document.documentElement.style.overflowY;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyOverflowX = document.body.style.overflowX;
    const originalBodyOverflowY = document.body.style.overflowY;

    // Lock html and body scroll
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overflowX = "hidden";
    document.documentElement.style.overflowY = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "hidden";

    // Prevent wheel and touchmove events outside modal-scroll-body from scrolling page background
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
      // Restore original inline overflow styles
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.documentElement.style.overflowX = originalHtmlOverflowX;
      document.documentElement.style.overflowY = originalHtmlOverflowY;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.overflowX = originalBodyOverflowX;
      document.body.style.overflowY = originalBodyOverflowY;

      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("wheel", handleWheel);

      // Restore exact scroll position
      window.scrollTo(0, savedScrollY);
    };
  }, []);



  // Auth state
  const { user } = useAuth();

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [detectedPages, setDetectedPages] = useState<number | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDetectingPages, setIsDetectingPages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Section 1: Print Type state
  const [printType, setPrintType] = useState<PrintType>("Black & White");
  const [bwPagesStr, setBwPagesStr] = useState<string>("");
  const [colorPagesStr, setColorPagesStr] = useState<string>("");
  const [rangeError, setRangeError] = useState<string | null>(null);

  // Section 2: Print Side & Paper Size state
  const [printSide, setPrintSide] = useState<PrintSide>("Single Side");
  const [paperSize, setPaperSize] = useState<string>("A/4");

  // Section 3: Media state
  const [media, setMedia] = useState<MediaOption>("Plain Paper");

  // Section 4: Binding state
  const [binding, setBinding] = useState<BindingOption>("No Binding");
  const [phone, setPhone] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [_uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  // Update default page ranges when file is uploaded or printType changes
  useEffect(() => {
    if (printType === "B&W + Color" && detectedPages) {
      if (!bwPagesStr) setBwPagesStr(`1-${Math.ceil(detectedPages / 2)}`);
      if (!colorPagesStr) setColorPagesStr(`${Math.ceil(detectedPages / 2) + 1}-${detectedPages}`);
    }
  }, [printType, detectedPages]);

  // Handle switching Print Side (update available paper sizes)
  const availableSizes = printSide === "Back to Back" ? BACK_TO_BACK_SIZES : SINGLE_SIDE_SIZES;
  const handlePrintSideChange = (newSide: PrintSide) => {
    setPrintSide(newSide);
    const validSizes = newSide === "Back to Back" ? BACK_TO_BACK_SIZES : SINGLE_SIDE_SIZES;
    if (!validSizes.includes(paperSize)) {
      setPaperSize(validSizes.includes("A/4") ? "A/4" : (validSizes[0] ?? "A/4"));
    }
  };

  // Handle switching Binding (clear phone validation if not Hard Binding)
  const handleBindingChange = (newBinding: BindingOption) => {
    setBinding(newBinding);
    if (newBinding !== "Hard Binding") {
      setPhoneError(null);
    }
  };

  // File Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setDetectedPages(null);

    // Reject video files explicitly
    if (file.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm|wmv|flv)$/i.test(file.name)) {
      setFileError("Video files are not supported. Please select a PDF, Word document, or Image.");
      setSelectedFile(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate supported file types (PDF, Word, Images)
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".webp"];

    const isAllowed =
      file.type.startsWith("image/") ||
      allowedTypes.includes(file.type) ||
      allowedExtensions.includes(ext);

    if (!isAllowed) {
      setFileError("Unsupported file type. Please upload a PDF, Word document, or Image.");
      setSelectedFile(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate size limit (25 MB)
    if (file.size > 25 * 1024 * 1024) {
      setFileError("File size exceeds 25 MB limit.");
      setSelectedFile(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);

    // Detect PDF page count
    if (file.type === "application/pdf" || ext === ".pdf") {
      setIsDetectingPages(true);
      const pages = await detectPdfPageCount(file);
      setIsDetectingPages(false);
      if (pages) {
        setDetectedPages(pages);
        setBwPagesStr(`1-${Math.max(1, Math.ceil(pages / 2))}`);
        setColorPagesStr(`${Math.max(1, Math.ceil(pages / 2) + 1)}-${pages}`);
      }
    }
  };

  // Pricing Calculation logic
  let totalBwPages = 0;
  let totalColorPages = 0;
  let calculationError: string | null = null;

  if (printType === "Black & White") {
    totalBwPages = detectedPages || 1;
    totalColorPages = 0;
  } else if (printType === "Color") {
    totalBwPages = 0;
    totalColorPages = detectedPages || 1;
  } else {
    // B&W + Color
    const bwParsed = parsePageRanges(bwPagesStr, detectedPages);
    const colorParsed = parsePageRanges(colorPagesStr, detectedPages);

    if (bwParsed.error) calculationError = bwParsed.error;
    else if (colorParsed.error) calculationError = colorParsed.error;
    else {
      // Check for overlapping pages
      const overlap = [...bwParsed.pages].filter((p) => colorParsed.pages.has(p));
      if (overlap.length > 0) {
        calculationError = `Page(s) ${overlap.join(", ")} assigned to both B&W and Color. Each page must be unique.`;
      } else {
        totalBwPages = bwParsed.pages.size;
        totalColorPages = colorParsed.pages.size;
      }
    }
  }

  const estimatedTotal = Math.max(0, totalBwPages * 2 + totalColorPages * 5);

  // Validate form before submission
  const validateForm = (): boolean => {
    setFileError(null);
    setRangeError(null);
    setPhoneError(null);

    if (!user || !user.email) {
      setFileError("Please log in before submitting a print request.");
      return false;
    }

    if (!selectedFile) {
      setFileError("Please upload a document to print.");
      return false;
    }

    if (printType === "B&W + Color") {
      const bwParsed = parsePageRanges(bwPagesStr, detectedPages);
      if (bwParsed.error) {
        setRangeError(`B&W Pages Error: ${bwParsed.error}`);
        return false;
      }
      const colorParsed = parsePageRanges(colorPagesStr, detectedPages);
      if (colorParsed.error) {
        setRangeError(`Color Pages Error: ${colorParsed.error}`);
        return false;
      }
      const overlap = [...bwParsed.pages].filter((p) => colorParsed.pages.has(p));
      if (overlap.length > 0) {
        setRangeError(`Page(s) ${overlap.join(", ")} cannot be assigned to both B&W and Color.`);
        return false;
      }
    }

    if (binding === "Hard Binding") {
      const cleanPhone = phone.trim();
      if (!cleanPhone) {
        setPhoneError("Phone number is required for Hard Binding.");
        return false;
      }
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setPhoneError("Please enter a valid 10-digit Indian phone number.");
        return false;
      }
    }

    return true;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    const result = await submitPrintRequest({
      selectedFile: selectedFile!,
      customerEmail: user?.email || undefined,
      totalPages: detectedPages ? detectedPages : "N/A",
      printType: printType,
      bwPages: printType === "B&W + Color" ? bwPagesStr.trim() : printType === "Black & White" ? "All pages" : undefined,
      colorPages: printType === "B&W + Color" ? colorPagesStr.trim() : printType === "Color" ? "All pages" : undefined,
      printSide: printSide,
      paperSize: paperSize,
      media: media,
      binding: binding,
      hardBindingPhone: binding === "Hard Binding" ? phone.trim() : undefined,
      totalAmount: estimatedTotal,
      paper: `${paperSize} · ${media}`,
      finishing: binding,
    });

    setIsSubmitting(false);

    if (result.success) {
      setUploadedFileUrl(result.fileUrl || null);
      setDone(true);
      toast.success("Printing request submitted successfully! 📄✨");
    } else {
      console.error("[UploadPrintModal] Submit error:", result.error);
      setFileError(result.error || "Failed to submit print request.");
      toast.error(result.error || "Failed to submit print request. Please try again.");
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
      <div className="relative z-[101] flex flex-col w-[min(100%-24px,900px)] max-h-[94dvh] sm:max-h-[92dvh] rounded-2xl sm:rounded-3xl border border-border/40 bg-background shadow-2xl overflow-hidden rise-in min-w-0 overscroll-contain">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="grid size-9 sm:size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Printer className="size-4.5 sm:size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">Printing Order</h3>
              <p className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">Upload &amp; Configure Print Details</p>
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
            <div className="space-y-6 py-6 text-center flex flex-col items-center justify-center min-h-[360px] min-w-0">
              <div className="rounded-full bg-emerald-500/10 p-4 border border-emerald-500/20 shrink-0">
                <CheckCircle2 className="size-12 text-emerald-600 animate-bounce" />
              </div>
              <div className="space-y-2 min-w-0 px-2">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">Print Request Submitted</h3>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground max-w-md mx-auto leading-relaxed break-words">
                  Your printing request has been sent to the shop.
                </p>
                {binding === "Hard Binding" && (
                  <p className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-xl p-3 max-w-md mx-auto mt-2 break-words">
                    📞 The shop owner will call you to confirm the hard binding requirements.
                  </p>
                )}
              </div>

              {/* Summary Card */}
              <div className="w-full max-w-md rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5 text-left space-y-2.5 text-xs min-w-0">
                <div className="font-bold text-xs sm:text-sm text-foreground border-b border-border/40 pb-2 flex justify-between items-center gap-2">
                  <span className="truncate">PRINTING ORDER SUMMARY</span>
                  <span className="text-primary shrink-0 font-extrabold">₹{estimatedTotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                  <span className="shrink-0">File:</span>
                  <span className="font-semibold text-foreground truncate min-w-0 max-w-[200px]">{fileName}</span>
                </div>
                <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                  <span className="shrink-0">Total pages:</span>
                  <span className="font-semibold text-foreground shrink-0">{detectedPages ? detectedPages : "N/A"}</span>
                </div>
                <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                  <span className="shrink-0">Print Type:</span>
                  <span className="font-semibold text-foreground truncate">{printType}</span>
                </div>
                {printType === "B&W + Color" && (
                  <>
                    <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                      <span className="shrink-0">B&amp;W Pages:</span>
                      <span className="font-semibold text-foreground truncate">{bwPagesStr}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                      <span className="shrink-0">Color Pages:</span>
                      <span className="font-semibold text-foreground truncate">{colorPagesStr}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                  <span className="shrink-0">Print Side:</span>
                  <span className="font-semibold text-foreground truncate">{printSide}</span>
                </div>
                <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                  <span className="shrink-0">Paper Size:</span>
                  <span className="font-semibold text-foreground shrink-0">{paperSize}</span>
                </div>
                <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                  <span className="shrink-0">Media:</span>
                  <span className="font-semibold text-foreground truncate">{media}</span>
                </div>
                <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                  <span className="shrink-0">Binding:</span>
                  <span className="font-semibold text-foreground truncate">{binding}</span>
                </div>
                <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                  <span className="shrink-0">Phone Number:</span>
                  <span className="font-semibold text-foreground truncate">
                    {binding === "Hard Binding" ? phone : "Not required"}
                  </span>
                </div>
              </div>

              <div className="w-full max-w-md pt-2 min-w-0">
                <Button onClick={onClose} className="w-full h-12 rounded-full font-bold text-sm shadow-md shrink-0">
                  Back to Home
                </Button>
              </div>
            </div>
          ) : (
            /* Print Order Form */
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 min-w-0">
              {/* Document Upload Area */}
              <div className="min-w-0 space-y-2">
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Document Upload <span className="text-destructive">*</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "group relative flex w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-2.5 sm:gap-3 rounded-2xl border-2 border-dashed p-4 sm:p-6 text-center transition-all overflow-hidden",
                    selectedFile
                      ? "border-primary/50 bg-primary/5 hover:bg-primary/10"
                      : "border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/40",
                    fileError && "border-destructive/60 bg-destructive/5"
                  )}
                >
                  {selectedFile ? (
                    <>
                      <div className="rounded-full bg-primary/10 p-2.5 text-primary shrink-0">
                        <FileText className="size-5 sm:size-6" />
                      </div>
                      <div className="min-w-0 w-full px-2">
                        <p className="font-bold text-foreground text-xs sm:text-sm truncate w-full">
                          {fileName}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-1 text-[11px] sm:text-xs text-muted-foreground">
                          <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                          {isDetectingPages ? (
                            <span className="text-primary flex items-center gap-1 font-medium">
                              <Loader2 className="size-3 animate-spin" /> Detecting pages...
                            </span>
                          ) : detectedPages !== null ? (
                            <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                              Total pages: {detectedPages}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary group-hover:underline shrink-0">
                        Change File
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="rounded-full bg-secondary p-2.5 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                        <FileUp className="size-5 sm:size-6" />
                      </div>
                      <div className="min-w-0 px-2">
                        <p className="font-bold text-foreground text-xs sm:text-sm">Click to upload document</p>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 break-words">
                          PDF, Word documents (.doc, .docx), or Images • Max 25 MB
                        </p>
                      </div>
                    </>
                  )}
                </div>
                {fileError && (
                  <p className="text-[11px] sm:text-xs font-semibold text-destructive px-1 flex items-center gap-1 break-words">
                    <AlertCircle className="size-3.5 shrink-0" /> {fileError}
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* SECTION 1 — PRINT TYPE */}
              <div className="min-w-0 space-y-3 rounded-2xl border border-border/50 bg-card p-3.5 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h4 className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                    Section 1 — Print Type
                  </h4>
                  {detectedPages && (
                    <span className="text-[11px] sm:text-xs font-bold text-muted-foreground">Total pages: {detectedPages}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 min-w-0">
                  {(["Black & White", "Color", "B&W + Color"] as PrintType[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setPrintType(option);
                        setRangeError(null);
                      }}
                      className={cn(
                        "flex flex-row sm:flex-col items-center justify-between sm:justify-center p-2.5 sm:p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer min-w-0",
                        printType === option
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border/60 bg-background text-foreground hover:border-primary/50"
                      )}
                    >
                      <span className="truncate">{option}</span>
                      <span className="text-[10px] font-normal opacity-85 shrink-0 sm:mt-0.5">
                        {option === "Black & White" ? "₹2/pg" : option === "Color" ? "₹5/pg" : "Mixed"}
                      </span>
                    </button>
                  ))}
                </div>

                {/* B&W + Color Range Inputs */}
                {printType === "B&W + Color" && (
                  <div className="mt-3 pt-3 border-t border-border/40 space-y-3 bg-muted/20 p-3 sm:p-4 rounded-xl min-w-0">
                    <p className="text-[11px] sm:text-xs font-semibold text-muted-foreground">
                      Specify page ranges (e.g. 1-10, 15-20):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                      <div className="min-w-0">
                        <label className="block text-[11px] sm:text-xs font-bold text-foreground mb-1">
                          Black &amp; White pages
                        </label>
                        <input
                          type="text"
                          value={bwPagesStr}
                          onChange={(e) => {
                            setBwPagesStr(e.target.value);
                            setRangeError(null);
                          }}
                          placeholder="e.g. 1-25"
                          className="w-full h-9 sm:h-10 px-3 text-xs font-medium rounded-lg border border-border/60 bg-background focus:border-primary focus:outline-none min-w-0"
                        />
                      </div>
                      <div className="min-w-0">
                        <label className="block text-[11px] sm:text-xs font-bold text-foreground mb-1">
                          Color pages
                        </label>
                        <input
                          type="text"
                          value={colorPagesStr}
                          onChange={(e) => {
                            setColorPagesStr(e.target.value);
                            setRangeError(null);
                          }}
                          placeholder="e.g. 26-50"
                          className="w-full h-9 sm:h-10 px-3 text-xs font-medium rounded-lg border border-border/60 bg-background focus:border-primary focus:outline-none min-w-0"
                        />
                      </div>
                    </div>
                    {rangeError && (
                      <p className="text-[11px] sm:text-xs font-semibold text-destructive px-1 flex items-start gap-1 break-words">
                        <AlertCircle className="size-3.5 shrink-0 mt-0.5" /> <span>{rangeError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 2 — PRINT SIDE & PAPER SIZE */}
              <div className="min-w-0 space-y-3 rounded-2xl border border-border/50 bg-card p-3.5 sm:p-5">
                <h4 className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                  Section 2 — Print Side &amp; Paper Size
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
                  {(["Single Side", "Back to Back"] as PrintSide[]).map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => handlePrintSideChange(side)}
                      className={cn(
                        "p-2.5 sm:p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center min-w-0 truncate",
                        printSide === side
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border/60 bg-background text-foreground hover:border-primary/50"
                      )}
                    >
                      {side}
                    </button>
                  ))}
                </div>

                <div className="pt-2 min-w-0">
                  <label className="block text-[11px] sm:text-xs font-bold text-muted-foreground mb-1.5">Available Paper Sizes</label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 min-w-0">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setPaperSize(size)}
                        className={cn(
                          "px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer shrink-0",
                          paperSize === size
                            ? "border-primary bg-primary/10 text-primary border-2"
                            : "border-border/60 bg-background text-foreground hover:border-primary/40"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 3 — MEDIA */}
              <div className="min-w-0 space-y-3 rounded-2xl border border-border/50 bg-card p-3.5 sm:p-5">
                <h4 className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                  Section 3 — Media
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 min-w-0">
                  {MEDIA_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMedia(m)}
                      className={cn(
                        "px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0",
                        media === m
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border/60 bg-background text-foreground hover:border-primary/50"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 4 — BINDING */}
              <div className="min-w-0 space-y-3 rounded-2xl border border-border/50 bg-card p-3.5 sm:p-5">
                <h4 className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                  Section 4 — Binding
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-0">
                  {BINDING_OPTIONS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleBindingChange(b)}
                      className={cn(
                        "p-2.5 sm:p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center min-w-0 truncate",
                        binding === b
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border/60 bg-background text-foreground hover:border-primary/50"
                      )}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                {/* Hard Binding Phone Input */}
                {binding === "Hard Binding" && (
                  <div className="mt-3 pt-3 border-t border-border/40 space-y-2 bg-primary/5 p-3 sm:p-3.5 rounded-xl border border-primary/20 animate-in fade-in min-w-0">
                    <label className="block text-[11px] sm:text-xs font-bold text-foreground">
                      Phone Number <span className="text-destructive">*</span>
                    </label>
                    <div className="relative min-w-0">
                      <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setPhoneError(null);
                        }}
                        placeholder="Enter your phone number (e.g. 9876543210)"
                        className="w-full h-9 sm:h-10 pl-9 pr-3 text-xs font-medium rounded-lg border border-border/60 bg-background focus:border-primary focus:outline-none min-w-0"
                      />
                    </div>
                    {phoneError && (
                      <p className="text-[11px] sm:text-xs font-semibold text-destructive px-1 flex items-center gap-1 break-words">
                        <AlertCircle className="size-3.5 shrink-0" /> {phoneError}
                      </p>
                    )}
                    <p className="text-[10px] sm:text-[11px] font-medium text-primary leading-tight break-words">
                      ℹ️ Our shop owner will call you to confirm the hard binding requirements.
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION 5 — ORDER SUMMARY */}
              <div className="min-w-0 rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                  <h4 className="font-display text-xs sm:text-sm font-extrabold uppercase tracking-wider text-foreground">
                    SECTION 5 — PRINTING ORDER SUMMARY
                  </h4>
                  <span className="text-[11px] sm:text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 shrink-0">
                    Est: ₹{estimatedTotal}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs min-w-0">
                  <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                    <span className="shrink-0">File:</span>
                    <span className="font-semibold text-foreground truncate min-w-0 max-w-[200px]">
                      {fileName || "No file uploaded"}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                    <span className="shrink-0">Total pages:</span>
                    <span className="font-semibold text-foreground shrink-0">{detectedPages !== null ? detectedPages : "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                    <span className="shrink-0">Print Type:</span>
                    <span className="font-semibold text-foreground truncate">{printType}</span>
                  </div>
                  {printType === "B&W + Color" && (
                    <>
                      <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                        <span className="shrink-0">B&amp;W Pages:</span>
                        <span className="font-semibold text-foreground truncate">{bwPagesStr || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                        <span className="shrink-0">Color Pages:</span>
                        <span className="font-semibold text-foreground truncate">{colorPagesStr || "N/A"}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                    <span className="shrink-0">Print Side:</span>
                    <span className="font-semibold text-foreground truncate">{printSide}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                    <span className="shrink-0">Paper Size:</span>
                    <span className="font-semibold text-foreground shrink-0">{paperSize}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                    <span className="shrink-0">Media:</span>
                    <span className="font-semibold text-foreground truncate">{media}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                    <span className="shrink-0">Binding:</span>
                    <span className="font-semibold text-foreground truncate">{binding}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground min-w-0 gap-2">
                    <span className="shrink-0">Phone Number:</span>
                    <span className="font-semibold text-foreground truncate">
                      {binding === "Hard Binding" ? phone || "Required" : "Not required"}
                    </span>
                  </div>
                </div>

                {calculationError && (
                  <p className="text-xs font-semibold text-destructive pt-1 border-t border-border/30 break-words">
                    ⚠️ {calculationError}
                  </p>
                )}
              </div>

              {/* CONTINUE BUTTON */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full shrink-0 h-12 sm:h-13 rounded-full font-bold text-sm sm:text-base shadow-lg transition-all hover:scale-[1.01]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" /> Submitting Request...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
