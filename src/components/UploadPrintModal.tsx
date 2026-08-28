import { CheckCircle2, FileUp, X, Loader2, FileText, Minus, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function UploadPrintModal({ onClose, serviceName }: { onClose: () => void; serviceName?: string | null }) {
  const allowedPrintTypes = (() => {
    if (serviceName === "B&W Printing") return ["B&W"];
    if (serviceName === "Color Printing") return ["Colour"];
    return ["B&W", "Colour"];
  })();

  const allowedPapers = (() => {
    if (serviceName === "Spiral Binding") return ["A4 · 75 GSM"];
    if (serviceName === "Resume Printing") return ["Bond paper"];
    if (serviceName === "Photocopy") return ["A4 · 75 GSM", "A3"];
    if (serviceName === "B&W Printing") return ["A4 · 75 GSM", "A3"];
    if (serviceName === "Project Printing") return ["A4 · 75 GSM", "Bond paper"];
    return ["A4 · 75 GSM", "A3", "Bond paper"];
  })();

  const allowedFinishings = (() => {
    if (serviceName === "Photocopy" || serviceName === "Resume Printing") return ["None"];
    if (serviceName === "Spiral Binding") return ["Spiral binding", "Comb binding"];
    if (serviceName === "Project Printing") return ["None", "Spiral binding", "Comb binding", "Lamination"];
    return ["None", "Spiral binding", "Comb binding", "Lamination"];
  })();

  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // Form State
  const [printType, setPrintType] = useState(allowedPrintTypes[0]);
  const [copies, setCopies] = useState(1);
  const [paper, setPaper] = useState(allowedPapers.includes("A4 · 75 GSM") ? "A4 · 75 GSM" : allowedPapers[0]);
  const [finishing, setFinishing] = useState(allowedFinishings.includes("None") ? "None" : allowedFinishings[0]);

  const showFinishing = allowedFinishings.length > 1 || allowedFinishings[0] !== "None";

  // Pricing Logic
  const basePrice = printType === "B&W" ? 2 : 5;
  const total = basePrice * copies;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    // Reject video files explicitly
    if (file.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm|wmv|flv)$/i.test(file.name)) {
      const msg = "Video files are not supported. Please select a PDF, Word document, or Image.";
      setFileError(msg);
      setSelectedFile(null);
      setFileName(null);
      if (input.current) input.current.value = "";
      return;
    }

    // Validate allowed file types (PDF, Word, Images)
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
      const msg = "Unsupported file type. Please upload a PDF, Word document, or Image.";
      setFileError(msg);
      setSelectedFile(null);
      setFileName(null);
      if (input.current) input.current.value = "";
      return;
    }

    // Validate size limit (25MB)
    if (file.size > 25 * 1024 * 1024) {
      const msg = "File size exceeds 25 MB limit.";
      setFileError(msg);
      setSelectedFile(null);
      setFileName(null);
      if (input.current) input.current.value = "";
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
  };

  const handleCopiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setCopies(Math.max(1, val));
    } else if (e.target.value === "") {
      // allow clearing briefly while typing
    }
  };

  const handleCopiesBlur = () => {
    if (!copies || copies < 1) setCopies(1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={onClose} />
      
      <div className="relative z-[101] flex max-h-[95vh] w-full max-w-lg flex-col rounded-2xl sm:rounded-[2rem] border border-border/40 bg-background shadow-[0_16px_64px_-12px_rgba(0,0,0,0.15)] overflow-hidden rise-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-6 sm:right-6 grid size-9 place-items-center rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="size-4.5" />
        </button>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8 no-scrollbar">
          {done ? (
            <div className="space-y-4 py-8 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="rounded-full bg-emerald-500/10 p-4">
                <CheckCircle2 className="size-12 text-emerald-600" />
              </div>
              <h3 className="font-display text-2xl font-bold">Print request received! 🎉</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Your selected printing details have been saved. Our team will review your requirements and get your order ready. We’ll keep you updated once it’s ready.
              </p>
              <Button
                onClick={onClose}
                className="mt-6 h-12 w-full max-w-[200px] rounded-full text-base font-semibold"
              >
                Done
              </Button>
            </div>
          ) : (
            <form
              className="space-y-6 sm:space-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedFile) {
                  setFileError("Please upload a file before submitting.");
                  return;
                }
                setIsSubmitting(true);
                // Simulate network request
                setTimeout(() => {
                  setIsSubmitting(false);
                  setDone(true);
                  toast.success("Print request received");
                }, 1200);
              }}
            >
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight">Upload &amp; Print</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose your options and submit your file for printing.
                </p>
              </div>

              <div>
                <div
                  onClick={() => input.current?.click()}
                  className={cn(
                    "group relative flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all",
                    selectedFile 
                      ? "border-primary/40 bg-primary/5 hover:bg-primary/10" 
                      : "border-border/60 bg-secondary/20 hover:border-primary/50 hover:bg-secondary/40",
                    fileError && "border-destructive/50 bg-destructive/5 hover:border-destructive/70"
                  )}
                >
                  {selectedFile ? (
                    <>
                      <div className="rounded-full bg-primary/10 p-3 text-primary">
                        <FileText className="size-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground truncate max-w-[250px] sm:max-w-[300px]">{fileName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <span className="mt-1 text-xs font-bold text-primary group-hover:underline">Change file</span>
                    </>
                  ) : (
                    <>
                      <div className="rounded-full bg-secondary p-3 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <FileUp className="size-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Upload your file</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, Word or Images • Max 25 MB</p>
                      </div>
                    </>
                  )}
                </div>
                {fileError && (
                  <p className="mt-2 text-xs font-semibold text-destructive px-1">{fileError}</p>
                )}
              </div>
              <input
                ref={input}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
                <Field label="Print type">
                  <Select value={printType} onValueChange={setPrintType}>
                    <SelectTrigger className="h-11 rounded-xl bg-background border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl z-[200]">
                      {allowedPrintTypes.includes("B&W") && <SelectItem value="B&W">B&amp;W · ₹2/page</SelectItem>}
                      {allowedPrintTypes.includes("Colour") && <SelectItem value="Colour">Colour · ₹5/page</SelectItem>}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Copies">
                  <div className="flex items-center h-11 w-full rounded-xl border border-border/60 bg-background overflow-hidden transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                    <button 
                      type="button" 
                      onClick={() => setCopies(Math.max(1, copies - 1))}
                      className="flex h-full w-12 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Minus className="size-4" />
                    </button>
                    <input 
                      type="number" 
                      min={1} 
                      value={copies || ""}
                      onChange={handleCopiesChange}
                      onBlur={handleCopiesBlur}
                      className="h-full flex-1 bg-transparent text-center text-sm font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setCopies(copies + 1)}
                      className="flex h-full w-12 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </Field>
                <Field label="Paper">
                  <Select value={paper} onValueChange={setPaper}>
                    <SelectTrigger className="h-11 rounded-xl bg-background border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl z-[200]">
                      {allowedPapers.includes("A4 · 75 GSM") && <SelectItem value="A4 · 75 GSM">A4 · 75 GSM</SelectItem>}
                      {allowedPapers.includes("A3") && <SelectItem value="A3">A3</SelectItem>}
                      {allowedPapers.includes("Bond paper") && <SelectItem value="Bond paper">Bond paper</SelectItem>}
                    </SelectContent>
                  </Select>
                </Field>
                {showFinishing && (
                  <Field label="Finishing">
                    <Select value={finishing} onValueChange={setFinishing}>
                      <SelectTrigger className="h-11 rounded-xl bg-background border-border/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl z-[200]">
                        {allowedFinishings.includes("None") && <SelectItem value="None">None</SelectItem>}
                        {allowedFinishings.includes("Spiral binding") && <SelectItem value="Spiral binding">Spiral binding</SelectItem>}
                        {allowedFinishings.includes("Comb binding") && <SelectItem value="Comb binding">Comb binding</SelectItem>}
                        {allowedFinishings.includes("Lamination") && <SelectItem value="Lamination">Lamination</SelectItem>}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </div>

              <div className="rounded-2xl border border-border/40 bg-secondary/20 p-5 sm:p-6">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Print Summary</h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Print type</span>
                    <span className="font-medium text-foreground">{printType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Copies</span>
                    <span className="font-medium text-foreground">{copies}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Paper</span>
                    <span className="font-medium text-foreground">{paper}</span>
                  </div>
                  {showFinishing && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Finishing</span>
                      <span className="font-medium text-foreground">{finishing}</span>
                    </div>
                  )}
                  <div className="mt-4 pt-4 flex justify-between items-center border-t border-border/40">
                    <span className="font-semibold text-foreground">Total Estimate</span>
                    <span className="font-display text-xl font-bold text-primary">₹{total}</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 sm:h-14 rounded-full font-bold text-base shadow-[0_4px_14px_0_rgba(59,130,246,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:scale-[1.01]"
              >
                {isSubmitting ? <Loader2 className="mr-2 size-5 animate-spin" /> : null}
                {isSubmitting ? "Submitting..." : "Submit & Print"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
