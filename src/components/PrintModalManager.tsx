import React, { useState, useEffect, lazy, Suspense } from "react";

const UploadPrintModal = lazy(() =>
  import("./UploadPrintModal").then((m) => ({ default: m.UploadPrintModal }))
);

export function PrintModalManager() {
  const [open, setOpen] = useState(false);
  const [service, setService] = useState<string | null>(null);

  useEffect(() => {
    const handleOpen = (e: CustomEvent<{ serviceName: string | null }>) => {
      setService(e.detail.serviceName);
      setOpen(true);
    };
    window.addEventListener("open-print-modal", handleOpen as EventListener);
    return () =>
      window.removeEventListener("open-print-modal", handleOpen as EventListener);
  }, []);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <UploadPrintModal onClose={() => setOpen(false)} serviceName={service} />
    </Suspense>
  );
}
