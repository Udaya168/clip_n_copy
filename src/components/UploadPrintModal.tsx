import { CheckCircle2, FileUp, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function UploadPrintModal({ onClose }: { onClose: () => void }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    // Reject video files explicitly
    if (file.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm|wmv|flv)$/i.test(file.name)) {
      const msg = "Video files are not supported for printing. Please select a PDF, Word document, or Image.";
      setFileError(msg);
      toast.error(msg);
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
      toast.error(msg);
      setSelectedFile(null);
      setFileName(null);
      if (input.current) input.current.value = "";
      return;
    }

    // Validate size limit (25MB)
    if (file.size > 25 * 1024 * 1024) {
      const msg = "File size exceeds 25 MB limit.";
      setFileError(msg);
      toast.error(msg);
      setSelectedFile(null);
      setFileName(null);
      if (input.current) input.current.value = "";
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
  };

  return (
    <div className="fixed inset-0 z-70 grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink/55 animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg surface-card p-6 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        {done ? (
          <div className="space-y-3 py-6 text-center">
            <CheckCircle2 className="mx-auto size-14 text-success" />
            <h3 className="font-display text-xl font-extrabold">Print request received! 🎉</h3>
            <p className="text-sm text-muted-foreground">
              Your print request has been received successfully. Your selected printing details have been saved. Our team will review your requirements and get your order ready. We’ll keep you updated once it’s ready.
            </p>
            <button
              onClick={onClose}
              className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              Done
            </button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedFile) {
                const msg = "Please select a PDF, Word document, or Image file to proceed.";
                setFileError(msg);
                toast.error(msg);
                return;
              }
              setDone(true);
              toast.success("Print request received");
            }}
          >
            <div>
              <h3 className="font-display text-xl font-extrabold">Upload &amp; Print</h3>
              <p className="text-sm text-muted-foreground">
                Choose your options and submit your file for printing.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => input.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary hover:bg-primary-soft/40"
              >
                <FileUp className="size-7 text-primary" />
                <span className="text-sm font-semibold">
                  {fileName ?? "Select a PDF, DOCX or image"}
                </span>
                <span className="text-xs text-muted-foreground">Max 25 MB (PDF, Word, Images only)</span>
              </button>
              {fileError && (
                <p className="mt-1.5 text-xs font-semibold text-destructive">{fileError}</p>
              )}
            </div>
            <input
              ref={input}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Print type">
                <select className="input-base">
                  <option>B&amp;W · ₹2/page</option>
                  <option>Colour · ₹5/page</option>
                </select>
              </Field>
              <Field label="Copies">
                <input type="number" min={1} defaultValue={1} className="input-base" />
              </Field>
              <Field label="Paper">
                <select className="input-base">
                  <option>A4 · 75 GSM</option>
                  <option>A3</option>
                  <option>Bond paper</option>
                </select>
              </Field>
              <Field label="Finishing">
                <select className="input-base">
                  <option>None</option>
                  <option>Spiral binding</option>
                  <option>Comb binding</option>
                  <option>Lamination</option>
                </select>
              </Field>
            </div>

            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground shadow-glow"
            >
              Submit print request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
