import React from "react";
import { AdminOrderNotification } from "@/lib/admin-notification-context";
import { BellRing, X, CheckCircle2, XCircle, VolumeX, Loader2, Eye, Printer, Sparkles, ShoppingBag } from "lucide-react";
import { inr } from "@/lib/shop-store";

interface NewOrderAlertModalProps {
  notifications: AdminOrderNotification[];
  activeAlarm: boolean;
  isAccepting: boolean;
  onAcceptOrder: (notif: AdminOrderNotification) => void;
  onRejectOrder: (notif: AdminOrderNotification) => void;
  onViewOrder: (notif: AdminOrderNotification) => void;
  onStopAlarm: () => void;
  onDismiss: (notif: AdminOrderNotification) => void;
}

export function NewOrderAlertModal({
  notifications,
  activeAlarm,
  isAccepting,
  onAcceptOrder,
  onRejectOrder,
  onViewOrder,
  onStopAlarm,
  onDismiss,
}: NewOrderAlertModalProps) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-[200] flex flex-col gap-4 max-h-[calc(100vh-100px)] overflow-y-auto overflow-x-hidden p-2 animate-in slide-in-from-right-8 duration-300 w-[95vw] sm:w-auto sm:min-w-[340px] max-w-[440px] pointer-events-auto">
      
      {/* Global Alarm Control */}
      {activeAlarm && (
        <div className="pointer-events-auto flex justify-end">
          <button
            type="button"
            onClick={onStopAlarm}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-lg backdrop-blur-md animate-pulse cursor-pointer"
            title="Silence alarm sound"
          >
            <VolumeX className="size-4" /> Stop Alarm Sound
          </button>
        </div>
      )}

      {/* Stack of Notifications */}
      {notifications.map((notification) => {
        const isPrinting = notification.requestCategory === "printing";
        const isCustomization = notification.requestCategory === "customization";

        const titleText = isPrinting
          ? "NEW PRINTING ORDER"
          : isCustomization
          ? "NEW CUSTOMIZATION REQUEST"
          : "NEW ORDER RECEIVED";

        const headerBgClass = isPrinting
          ? "bg-blue-600 text-white"
          : isCustomization
          ? "bg-purple-600 text-white"
          : "bg-primary text-primary-foreground";

        const HeaderIcon = isPrinting ? Printer : isCustomization ? Sparkles : ShoppingBag;

        return (
          <div 
            key={notification.id}
            className={`shrink-0 pointer-events-auto bg-card border-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col w-full animate-in zoom-in-95 duration-200 ${
              isPrinting ? "border-blue-500/40" : isCustomization ? "border-purple-500/40" : "border-primary/40"
            }`}
          >
            {/* Header */}
            <div className={`${headerBgClass} px-4 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="grid size-8 place-items-center rounded-xl bg-white/20 text-white shadow-inner animate-bounce shrink-0">
                  <HeaderIcon className="size-4" />
                </div>
                <h2 className="font-display text-xs sm:text-sm font-black uppercase tracking-wider text-white truncate">
                  {titleText}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(notification)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer shrink-0 ml-1"
                title="Close notification"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground font-semibold">Customer:</span>
                <span className="font-bold text-foreground truncate max-w-[220px]" title={notification.customerName}>
                  {notification.customerName}
                </span>
              </div>

              {notification.customerEmail && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground font-semibold">Email:</span>
                  <span className="font-medium text-foreground truncate max-w-[220px]" title={notification.customerEmail}>
                    {notification.customerEmail}
                  </span>
                </div>
              )}

              {notification.customerPhone && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground font-semibold">Phone:</span>
                  <span className="font-medium text-foreground">{notification.customerPhone}</span>
                </div>
              )}

              {isPrinting ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground font-semibold">Print Type:</span>
                    <span className="font-bold text-blue-600">{notification.printType}</span>
                  </div>
                  {notification.paper && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground font-semibold">Paper &amp; Media:</span>
                      <span className="font-medium text-foreground truncate max-w-[200px]">{notification.paper}</span>
                    </div>
                  )}
                  {notification.totalAmount > 0 && (
                    <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-1.5 mt-1">
                      <span className="text-muted-foreground font-bold">Total Amount:</span>
                      <span className="font-black text-blue-600 text-sm">{inr(notification.totalAmount)}</span>
                    </div>
                  )}
                </>
              ) : isCustomization ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground font-semibold">Type:</span>
                    <span className="font-bold text-purple-600">{notification.customizationType}</span>
                  </div>
                  {notification.customizationTitle && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground font-semibold">Title:</span>
                      <span className="font-medium text-foreground truncate max-w-[200px]">{notification.customizationTitle}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground font-semibold">Quantity:</span>
                    <span className="font-bold text-foreground">{notification.quantity}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground font-semibold">Order ID:</span>
                  <span className="font-bold text-foreground">#{notification.orderNumber}</span>
                </div>
              )}
              
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onViewOrder(notification)}
                  className={`w-full py-2.5 rounded-xl border font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    isPrinting
                      ? "border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700"
                      : isCustomization
                      ? "border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700"
                      : "border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
                  }`}
                >
                  <Eye className="size-4" />
                  {isPrinting ? "View Printing Details" : isCustomization ? "View Customization Details" : "View Order"}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 bg-secondary/50 border-t border-border grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isAccepting}
                onClick={() => onAcceptOrder(notification)}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAccepting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                ACCEPT
              </button>

              <button
                type="button"
                disabled={isAccepting}
                onClick={() => onRejectOrder(notification)}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <XCircle className="size-4" />
                DISMISS
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
