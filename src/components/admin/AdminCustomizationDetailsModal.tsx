import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AdminOrderNotification } from "@/lib/admin-notification-context";
import { Sparkles, User, Phone, Mail, FileText, ExternalLink, Calendar, Layers, Hash } from "lucide-react";

interface AdminCustomizationDetailsModalProps {
  notification: AdminOrderNotification | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminCustomizationDetailsModal({
  notification,
  isOpen,
  onClose,
}: AdminCustomizationDetailsModalProps) {
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
        <div className="flex items-center justify-between border-b border-border bg-purple-500/10 px-6 py-4 shrink-0 pr-14">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-purple-600 text-white shadow-sm">
              <Sparkles className="size-5" />
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
              <User className="size-3.5 text-purple-600" /> Customer Information
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
                <p className="text-muted-foreground text-[11px]">Contact Phone Number</p>
                <p className="font-bold text-foreground text-sm mt-0.5">{notification.customerPhone || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Request ID</p>
                <p className="font-mono font-bold text-purple-600 text-xs mt-0.5">{notification.orderId}</p>
              </div>
            </div>
          </div>

          {/* Customization Details Card */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-2 border-b border-purple-500/20 pb-2">
              <Sparkles className="size-3.5 text-purple-600" /> Customization Specifications
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground text-[11px]">Type of Customization</p>
                <p className="font-bold text-foreground mt-0.5">{notification.customizationType || "Customization"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Quantity</p>
                <p className="font-bold text-foreground mt-0.5">{notification.quantity || 1}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground text-[11px]">Title / Requirement Description</p>
                <p className="font-bold text-foreground text-sm mt-0.5 break-words">{notification.customizationTitle || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Uploaded Preference File Card */}
          <div className="rounded-2xl border border-border p-4 bg-card space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText className="size-3.5 text-purple-600" /> Uploaded Preference File
            </h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border">
              <span className="font-bold text-foreground truncate max-w-[260px]">
                {notification.fileName || "Uploaded Preference File"}
              </span>
              {notification.fileUrl ? (
                <a
                  href={notification.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors"
                >
                  <ExternalLink className="size-3.5" /> View Preference File
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
