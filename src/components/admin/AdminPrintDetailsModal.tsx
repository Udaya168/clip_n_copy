import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AdminOrderNotification } from "@/lib/admin-notification-context";
import { Printer, User, Phone, Mail, FileText, Download, ExternalLink, Calendar, DollarSign, CheckCircle2 } from "lucide-react";
import { inr } from "@/lib/shop-store";

interface AdminPrintDetailsModalProps {
  notification: AdminOrderNotification | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPrintDetailsModal({
  notification,
  isOpen,
  onClose,
}: AdminPrintDetailsModalProps) {
  if (!notification) return null;

  const dateStr = notification.createdAt
    ? new Date(notification.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "Just now";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl w-full rounded-3xl p-0 overflow-hidden border border-border bg-background shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-blue-500/10 px-6 py-4 shrink-0 pr-14">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Printer className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg font-black text-foreground font-mono">
                {notification.orderNumber}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Submitted on <span className="font-semibold text-foreground">{dateStr}</span>
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* Customer Info Card */}
          <div className="rounded-2xl border border-border p-4 bg-card space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border/50 pb-2">
              <User className="size-3.5 text-blue-600" /> Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-muted-foreground text-[11px]">Customer Name</p>
                <p className="font-bold text-foreground text-sm mt-0.5">{notification.customerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Registered Email</p>
                <p className="font-bold text-foreground text-sm mt-0.5">{notification.customerEmail || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Customer Phone</p>
                <p className="font-bold text-foreground text-sm mt-0.5">{notification.customerPhone || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Request ID</p>
                <p className="font-mono font-bold text-blue-600 text-xs mt-0.5">{notification.orderId}</p>
              </div>
            </div>
          </div>

          {/* Print Specifications Card */}
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2 border-b border-blue-500/20 pb-2">
              <Printer className="size-3.5 text-blue-600" /> Print Specifications
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground text-[11px]">Print Type</p>
                <p className="font-bold text-foreground mt-0.5">{notification.printType || "B&W"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Paper &amp; Media</p>
                <p className="font-bold text-foreground mt-0.5">{notification.paper || "Standard"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Finishing / Binding</p>
                <p className="font-bold text-foreground mt-0.5">{notification.finishing || "None"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Copies / Quantity</p>
                <p className="font-bold text-foreground mt-0.5">{notification.itemsCount || 1}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Total Amount</p>
                <p className="font-extrabold text-blue-600 text-sm mt-0.5">{inr(notification.totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Uploaded File Card */}
          <div className="rounded-2xl border border-border p-4 bg-card space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText className="size-3.5 text-blue-600" /> Uploaded Document
            </h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border">
              <span className="font-bold text-foreground truncate max-w-[260px]">
                {notification.fileName || "Uploaded File"}
              </span>
              {notification.fileUrl ? (
                <a
                  href={notification.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="size-3.5" /> View File
                </a>
              ) : (
                <span className="text-xs font-medium text-muted-foreground">Stored in Database</span>
              )}
            </div>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
