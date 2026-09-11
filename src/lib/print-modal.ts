export function openPrintModal(serviceName: string | null = null) {
  window.dispatchEvent(
    new CustomEvent("open-print-modal", { detail: { serviceName } })
  );
}
