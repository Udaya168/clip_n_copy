export interface StoreSettings {
  id?: string | number;
  is_online: boolean;
  store_status?: "open" | "temporarily_closed" | "closed";
  closure_type?: "temporary" | "indefinite" | null;
  reopen_at?: string | null;
  closure_message?: string | null;
  auto_reopen?: boolean;
  opening_time?: string;
  manual_mode?: boolean | string;
  auto_schedule_enabled?: boolean;
  auto_open_time?: string;
  auto_close_time?: string;
  manual_override?: boolean;
  manual_override_at?: string | null;
  last_auto_status_change?: string | null;
  auto_closed_at?: string | null;
  updated_at?: string;
  updated_by?: string | null;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  id: "global",
  is_online: true,
  store_status: "open",
  closure_type: null,
  reopen_at: null,
  closure_message: null,
  auto_reopen: true,
  opening_time: "09:00:00",
  manual_mode: true,
  auto_schedule_enabled: false,
  auto_open_time: "09:00",
  auto_close_time: "21:00",
  manual_override: true,
  manual_override_at: null,
  last_auto_status_change: null,
  auto_closed_at: null,
};

export interface EvaluatedStoreStatus {
  isOnline: boolean;
  statusLabel: string;
  statusBadge: "online" | "offline";
  statusMessage?: string;
  storeStatus: "open" | "temporarily_closed" | "closed";
  closureType?: "temporary" | "indefinite" | null;
  reopenAtFormatted?: string;
  closureMessage?: string;
}

export function formatReopenDate(_reopenAtStr?: string | null): string {
  return "";
}

export function readSettings(): StoreSettings {
  return DEFAULT_SETTINGS;
}

export function getStoredStoreSettings(): StoreSettings {
  return DEFAULT_SETTINGS;
}

export function evaluateStoreStatus(_settings?: Partial<StoreSettings> | null): EvaluatedStoreStatus {
  return {
    isOnline: true,
    statusLabel: "Open",
    statusBadge: "online",
    statusMessage: "Store is open",
    storeStatus: "open",
    closureType: null,
    reopenAtFormatted: "",
    closureMessage: "",
  };
}

export function isStoreOpen(_settings?: Partial<StoreSettings> | null): boolean {
  return true;
}

export function useStoreStatus() {
  return {
    settings: DEFAULT_SETTINGS,
    isOnline: true,
    statusLabel: "Open",
    statusBadge: "online" as const,
    statusMessage: "Store is open",
    storeStatus: "open" as const,
    closureType: null,
    reopenAtFormatted: "",
    closureMessage: "",
    loading: false,
    refresh: async () => {},
    updateMode: async () => true,
    updateClosureSettings: async () => true,
  };
}
