import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface StoreSettings {
  id?: string | number | undefined;
  is_online: boolean;
  store_status?: "open" | "temporarily_closed" | "closed" | undefined;
  closure_type?: "temporary" | "indefinite" | null | undefined;
  reopen_at?: string | null | undefined;
  closure_message?: string | null | undefined;
  auto_reopen?: boolean | undefined;
  opening_time?: string | undefined;
  manual_mode?: boolean | string | undefined;
  auto_schedule_enabled?: boolean | undefined;
  auto_open_time?: string | undefined;
  auto_close_time?: string | undefined;
  manual_override?: boolean | undefined;
  manual_override_at?: string | null | undefined;
  last_auto_status_change?: string | null | undefined;
  auto_closed_at?: string | null | undefined;
  updated_at?: string | undefined;
  updated_by?: string | null | undefined;
}

const SETTINGS_KEY = "cnc-store-settings-v4";

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
  auto_schedule_enabled: true,
  auto_open_time: "09:00",
  auto_close_time: "21:00",
  manual_override: true,
  manual_override_at: null,
  last_auto_status_change: null,
  auto_closed_at: null,
};

export function formatReopenDate(reopenAtStr?: string | null): string {
  if (!reopenAtStr) return "";
  try {
    const d = new Date(reopenAtStr);
    if (isNaN(d.getTime())) return "";
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "long" });
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day} ${month} ${year} at ${hours}:${minutes} ${ampm}`;
  } catch {
    return "";
  }
}

export function readSettings(): StoreSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      is_online: Boolean(parsed.is_online),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function getStoredStoreSettings(): StoreSettings {
  return cachedSettings || readSettings();
}

function writeSettings(settings: StoreSettings) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore quota errors
    }
  }
}

export interface EvaluatedStoreStatus {
  isOnline: boolean;
  statusLabel: string;
  statusBadge: "online" | "offline";
  statusMessage?: string;
  storeStatus: "open" | "temporarily_closed" | "closed";
  closureType?: "temporary" | "indefinite" | null;
  reopenAtFormatted?: string | null;
  closureMessage?: string | null;
  autoReopen?: boolean;
}

export function isStoreOpenIST(date: Date = new Date()): boolean {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  });
  
  const parts = formatter.formatToParts(date);
  let hour = 0;
  for (const part of parts) {
    if (part.type === "hour") {
      hour = parseInt(part.value, 10);
    }
  }
  
  return hour >= 9 && hour < 21;
}

export function isManualOverrideExpired(overrideAtStr?: string | null, now: Date = new Date()): boolean {
  if (!overrideAtStr) return true;
  
  const overrideTime = new Date(overrideAtStr).getTime();
  if (isNaN(overrideTime)) return true;

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  });
  
  const parts = formatter.formatToParts(now);
  let year = 2026, month = 1, day = 1, hour = 0;
  for (const p of parts) {
    if (p.type === "year") year = parseInt(p.value, 10);
    if (p.type === "month") month = parseInt(p.value, 10) - 1;
    if (p.type === "day") day = parseInt(p.value, 10);
    if (p.type === "hour") hour = parseInt(p.value, 10);
  }

  let boundaryYear = year;
  let boundaryMonth = month;
  let boundaryDay = day;
  let boundaryHourIST = 9;

  if (hour >= 21) {
    boundaryHourIST = 21;
  } else if (hour >= 9) {
    boundaryHourIST = 9;
  } else {
    boundaryHourIST = 21;
    const yesterday = new Date(Date.UTC(year, month, day - 1));
    boundaryYear = yesterday.getUTCFullYear();
    boundaryMonth = yesterday.getUTCMonth();
    boundaryDay = yesterday.getUTCDate();
  }

  const boundaryUtcMs = Date.UTC(boundaryYear, boundaryMonth, boundaryDay, boundaryHourIST - 5, -30, 0);
  return overrideTime < boundaryUtcMs;
}

export function evaluateStoreStatus(settings?: StoreSettings | null): EvaluatedStoreStatus {
  const currentSettings = settings || DEFAULT_SETTINGS;
  const isOnlineDb = Boolean(currentSettings.is_online);

  console.log("[STORE STATUS] Current DB status:", isOnlineDb);

  // 1. TEMPORARY CLOSURE (Explicit schedule)
  if (currentSettings.store_status === "temporarily_closed" || currentSettings.closure_type === "temporary") {
    const reopenMs = currentSettings.reopen_at ? new Date(currentSettings.reopen_at).getTime() : 0;
    const hasReachedReopenTime = reopenMs > 0 && Date.now() >= reopenMs;

    if (!hasReachedReopenTime) {
      return {
        isOnline: false,
        statusLabel: "Store is Closed",
        statusBadge: "offline",
        statusMessage: currentSettings.closure_message || "Orders are currently disabled.",
        storeStatus: "temporarily_closed",
        closureType: "temporary",
        reopenAtFormatted: formatReopenDate(currentSettings.reopen_at),
        closureMessage: currentSettings.closure_message || null,
        autoReopen: currentSettings.auto_reopen ?? true,
      };
    }
  }

  // 2. CHECK MANUAL OVERRIDE STATUS & EXPIRATION
  const isManualOverrideRecorded = currentSettings.manual_override === true ||
                                   currentSettings.manual_mode === true ||
                                   currentSettings.manual_mode === "manual";

  const isExpired = isManualOverrideExpired(currentSettings.manual_override_at);

  if (isManualOverrideRecorded && !isExpired) {
    if (isOnlineDb) {
      console.log("[STORE STATUS] Manual ON");
      return {
        isOnline: true,
        statusLabel: "Store is Open",
        statusBadge: "online",
        statusMessage: "Store set to OPEN manually by owner.",
        storeStatus: "open",
        closureType: null,
        reopenAtFormatted: null,
        closureMessage: null,
        autoReopen: true,
      };
    } else {
      console.log("[STORE STATUS] Manual OFF");
      return {
        isOnline: false,
        statusLabel: "Store is Closed",
        statusBadge: "offline",
        statusMessage: currentSettings.closure_message || "Store set to OFFLINE manually by owner.",
        storeStatus: "closed",
        closureType: "indefinite",
        reopenAtFormatted: null,
        closureMessage: currentSettings.closure_message || null,
        autoReopen: false,
      };
    }
  }

  // 3. AUTOMATIC SCHEDULE EVALUATION (Asia/Kolkata IST 9:00 AM - 9:00 PM)
  const isCurrentlyOpenIST = isStoreOpenIST();

  if (isCurrentlyOpenIST) {
    console.log("[STORE STATUS] Automatic OPEN");
    return {
      isOnline: true,
      statusLabel: "Store is Open",
      statusBadge: "online",
      statusMessage: "Store is open (Schedule: 9:00 AM - 9:00 PM IST).",
      storeStatus: "open",
      closureType: null,
      reopenAtFormatted: null,
      closureMessage: null,
      autoReopen: true,
    };
  } else {
    console.log("[STORE STATUS] Automatic CLOSE");
    return {
      isOnline: false,
      statusLabel: "Store is Closed",
      statusBadge: "offline",
      statusMessage: "Store is closed (Schedule: 9:00 AM - 9:00 PM IST).",
      storeStatus: "closed",
      closureType: "indefinite",
      reopenAtFormatted: null,
      closureMessage: null,
      autoReopen: true,
    };
  }
}

let cachedSettings: StoreSettings = readSettings();
let isApiFetchDisabled = false;
let lastApiFetchTime = 0;
const listeners = new Set<() => void>();

// Safe single Realtime Subscription setup (removes any existing topic channel first, .on before .subscribe)
if (typeof window !== "undefined") {
  try {
    const existingChannel = supabase
      .getChannels()
      .find((c: any) => c.topic === "realtime:store_settings_changes" || c.topic === "store_settings_changes");
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    supabase
      .channel("store_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings" },
        (payload: any) => {
          console.log("[STORE STATUS] Realtime update:", payload);
          fetchStoreSettings(true);
        }
      )
      .subscribe((status: any) => {
        console.log("[STORE STATUS] Realtime subscription:", status);
      });

    window.addEventListener("focus", () => {
      fetchStoreSettings(true);
    });
  } catch (err) {
    console.error("[STORE STATUS] Realtime subscription error:", err);
  }
}

export async function fetchStoreSettings(force = false): Promise<StoreSettings> {
  const now = Date.now();
  if (!force && isApiFetchDisabled && now - lastApiFetchTime < 60000) {
    return cachedSettings || DEFAULT_SETTINGS;
  }
  if (!force && now - lastApiFetchTime < 2000) {
    return cachedSettings || DEFAULT_SETTINGS;
  }
  lastApiFetchTime = now;

  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[STORE STATUS] Fetch Error:", error.message);
      isApiFetchDisabled = true;
    } else if (data) {
      isApiFetchDisabled = false;
      const isOnline = Boolean(data.is_online);

      cachedSettings = {
        id: data.id || "global",
        is_online: isOnline,
        store_status: isOnline ? "open" : "closed",
        closure_type: data.closure_type || null,
        reopen_at: data.reopen_at || null,
        closure_message: data.closure_message || null,
        auto_reopen: data.auto_reopen ?? true,
        opening_time: data.opening_time || "09:00:00",
        manual_mode: data.manual_mode ?? true,
        auto_schedule_enabled: data.auto_schedule_enabled ?? true,
        auto_open_time: data.auto_open_time || "09:00",
        auto_close_time: data.auto_close_time || "21:00",
        manual_override: data.manual_override ?? true,
        manual_override_at: data.manual_override_at || null,
        last_auto_status_change: data.last_auto_status_change || null,
        auto_closed_at: data.auto_closed_at || null,
        updated_at: data.updated_at,
        updated_by: data.updated_by || null,
      };
      writeSettings(cachedSettings);
      listeners.forEach((cb) => cb());
    }
  } catch (err) {
    console.error("[STORE STATUS] Fetch Exception:", err);
    isApiFetchDisabled = true;
  }

  return cachedSettings || DEFAULT_SETTINGS;
}

async function saveStoreSettingsRow(fullPayload: StoreSettings): Promise<void> {
  const isOnlineBool = Boolean(fullPayload.is_online);

  // 1. Fetch existing row to target by its primary key ID
  const { data: existingRow, error: selectErr } = await supabase
    .from("store_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (selectErr) {
    console.error("[STORE STATUS] SELECT ERROR:", selectErr);
  }

  // Exact manual ON/OFF payload containing ONLY valid existing columns
  const payload = {
    is_online: isOnlineBool,
    manual_mode: true,
    manual_override: true,
    manual_override_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  console.log("[STORE STATUS] PATCH PAYLOAD", payload);

  if (existingRow && existingRow.id !== undefined && existingRow.id !== null) {
    const { data, error } = await supabase
      .from("store_settings")
      .update(payload)
      .eq("id", existingRow.id);

    if (error) {
      console.error("[STORE STATUS] PATCH ERROR", {
        data,
        error,
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
      });

      // Fallback payload with ONLY is_online & updated_at if schema cache lacks manual_override/manual_mode
      const fallbackPayload = {
        is_online: isOnlineBool,
        updated_at: payload.updated_at,
      };

      console.log("[STORE STATUS] FALLBACK PATCH PAYLOAD", fallbackPayload);

      const { data: fbData, error: fbError } = await supabase
        .from("store_settings")
        .update(fallbackPayload)
        .eq("id", existingRow.id);

      if (fbError) {
        console.error("[STORE STATUS] PATCH ERROR", {
          data: fbData,
          error: fbError,
          code: fbError?.code,
          message: fbError?.message,
          details: fbError?.details,
          hint: fbError?.hint,
        });
        throw fbError;
      } else {
        console.log("[STORE STATUS] PATCH SUCCESS", fbData);
      }
    } else {
      console.log("[STORE STATUS] PATCH SUCCESS", data);
    }
  } else {
    const { data: insertData, error: insertError } = await supabase
      .from("store_settings")
      .insert(payload);

    if (insertError) {
      console.error("[STORE STATUS] PATCH ERROR", {
        data: insertData,
        error: insertError,
        code: insertError?.code,
        message: insertError?.message,
        details: insertError?.details,
        hint: insertError?.hint,
      });
      throw insertError;
    } else {
      console.log("[STORE STATUS] PATCH SUCCESS", insertData);
    }
  }
}

export async function updateStoreSettings(newMode: "auto" | "online" | "offline" | boolean): Promise<StoreSettings> {
  console.log("[STORE STATUS] ON/OFF clicked:", newMode);
  let targetOnline = true;

  if (typeof newMode === "boolean") {
    targetOnline = newMode;
  } else if (newMode === "offline") {
    targetOnline = false;
  } else if (newMode === "online") {
    targetOnline = true;
  } else {
    targetOnline = true;
  }

  const fullPayload: StoreSettings = {
    is_online: targetOnline,
    store_status: targetOnline ? "open" : "closed",
    closure_type: targetOnline ? null : "indefinite",
    reopen_at: null,
    closure_message: null,
    auto_reopen: targetOnline ? true : false,
    manual_mode: true,
    manual_override: true,
    manual_override_at: new Date().toISOString(),
    auto_closed_at: null,
    updated_at: new Date().toISOString(),
  };

  try {
    await saveStoreSettingsRow(fullPayload);
  } catch (err) {
    console.error("[STORE STATUS] PATCH ERROR", err);
    throw err;
  }

  const refetched = await fetchStoreSettings(true);
  console.log("[STORE STATUS] Refetched status:", {
    is_online: refetched.is_online,
    store_status: refetched.store_status,
  });

  return refetched;
}

export async function updateStoreClosureSettings(params: {
  store_status: "open" | "temporarily_closed" | "closed";
  closure_type?: "temporary" | "indefinite" | null;
  reopen_at?: string | null;
  closure_message?: string | null;
  auto_reopen?: boolean;
}): Promise<StoreSettings> {
  console.log("[STORE STATUS] Closure update clicked:", params);
  const isOnline = params.store_status === "open";

  const fullPayload: StoreSettings = {
    is_online: isOnline,
    store_status: params.store_status,
    closure_type: params.closure_type || (isOnline ? null : "indefinite"),
    reopen_at: params.reopen_at || null,
    closure_message: params.closure_message || null,
    auto_reopen: params.auto_reopen ?? (isOnline ? true : false),
    manual_mode: true,
    manual_override: true,
    manual_override_at: new Date().toISOString(),
    auto_closed_at: null,
    updated_at: new Date().toISOString(),
  };

  try {
    await saveStoreSettingsRow(fullPayload);
  } catch (err) {
    console.error("[STORE STATUS] PATCH ERROR", err);
    throw err;
  }

  const refetched = await fetchStoreSettings(true);
  console.log("[STORE STATUS] Refetched status:", {
    is_online: refetched.is_online,
    store_status: refetched.store_status,
  });

  return refetched;
}

export function useStoreStatus() {
  const [settings, setSettings] = useState<StoreSettings>(cachedSettings || DEFAULT_SETTINGS);
  const [, setTick] = useState<number>(Date.now());

  useEffect(() => {
    fetchStoreSettings(true);

    const handleUpdate = () => {
      setSettings({ ...(cachedSettings || DEFAULT_SETTINGS) });
    };

    listeners.add(handleUpdate);

    const interval = setInterval(() => {
      setTick(Date.now());
    }, 10000);

    return () => {
      listeners.delete(handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const statusInfo = evaluateStoreStatus(settings);

  return {
    settings: settings || DEFAULT_SETTINGS,
    isOnline: statusInfo.isOnline,
    statusLabel: statusInfo.statusLabel,
    statusBadge: statusInfo.statusBadge,
    statusMessage: statusInfo.statusMessage,
    storeStatus: statusInfo.storeStatus,
    closureType: statusInfo.closureType,
    reopenAtFormatted: statusInfo.reopenAtFormatted,
    closureMessage: statusInfo.closureMessage,
    autoReopen: statusInfo.autoReopen,
    updateMode: updateStoreSettings,
    updateStatus: updateStoreSettings,
    updateClosureSettings: updateStoreClosureSettings,
    refresh: () => fetchStoreSettings(true),
  };
}
