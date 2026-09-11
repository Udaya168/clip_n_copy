import React from "react";
import { AdminOrderNotification } from "@/lib/admin-notification-context";
import { BellRing, X, CheckCircle2, XCircle, VolumeX, Loader2, Eye } from "lucide-react";

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
    <div className="fixed top-20 right-4 sm:right-6 z-[200] flex flex-col gap-4 max-h-[calc(100vh-100px)] overflow-y-auto overflow-x-hidden p-2 animate-in slide-in-from-right-8 duration-300 w-[95vw] sm:w-auto sm:min-w-[320px] max-w-[420px] pointer-events-auto">
      
      {/* Global Alarm Control - Only show if alarm is active */}
      {activeAlarm && (
        <div className="pointer-events-auto flex justify-end">
          <button
            type="button"
            onClick={onStopAlarm}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-lg backdrop-blur-md animate-pulse"
            title="Silence alarm sound"
          >
            <VolumeX className="size-4" /> Stop Alarm Sound
          </button>
        </div>
      )}

      {/* Stack of Notifications */}
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className="shrink-0 pointer-events-auto bg-card border-2 border-primary/40 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col w-full animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 place-items-center rounded-xl bg-white/20 text-white shadow-inner animate-bounce shrink-0">
                <BellRing className="size-4" />
              </div>
              <h2 className="font-display text-sm sm:text-base font-black uppercase tracking-wider text-white">
                NEW ORDER RECEIVED
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(notification)}
              className="p-1.5 rounded-lg text-primary-foreground/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Close notification"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-semibold">Customer:</p>
              <p className="text-sm font-bold text-foreground truncate max-w-[200px]" title={notification.customerName}>
                {notification.customerName}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-semibold">Order:</p>
              <p className="text-sm font-bold text-foreground">
                #{notification.orderNumber}
              </p>
            </div>
            
            <div className="pt-3">
              <button
                type="button"
                onClick={() => onViewOrder(notification)}
                className="w-full py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="size-4" /> View Order
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 bg-secondary/50 border-t border-border grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isAccepting}
              onClick={() => onAcceptOrder(notification)}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="size-4" />
              REJECT
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
