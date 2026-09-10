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
  opening_time?: string | undefined; // "09:00:00"
  manual_mode?: boolean | undefined;
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
  manual_mode: false,
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
      manual_mode: Boolean(parsed.manual_mode),
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

export function evaluateStoreStatus(settings?: StoreSettings | null): EvaluatedStoreStatus {
  const currentSettings = settings || DEFAULT_SETTINGS;
  const nowMs = Date.now();

  // 1. TEMPORARY CLOSURE
  if (currentSettings.store_status === "temporarily_closed" || currentSettings.closure_type === "temporary") {
    const reopenMs = currentSettings.reopen_at ? new Date(currentSettings.reopen_at).getTime() : 0;
    const hasReachedReopenTime = reopenMs > 0 && nowMs >= reopenMs;

    if (hasReachedReopenTime && currentSettings.auto_reopen !== false) {
      return {
        isOnline: true,
        statusLabel: "Store is Open",
        statusBadge: "online",
        statusMessage: "Accepting new orders",
        storeStatus: "open",
        closureType: null,
        reopenAtFormatted: null,
        closureMessage: null,
        autoReopen: true,
      };
    }

    return {
      isOnline: false,
      statusLabel: "Store Temporarily Closed",
      statusBadge: "offline",
      statusMessage: "Orders are currently disabled.",
      storeStatus: "temporarily_closed",
      closureType: "temporary",
      reopenAtFormatted: formatReopenDate(currentSettings.reopen_at),
      closureMessage: currentSettings.closure_message || null,
      autoReopen: currentSettings.auto_reopen ?? true,
    };
  }

  // 2. INDEFINITE CLOSURE / STORE CLOSED
  if (currentSettings.store_status === "closed" || currentSettings.is_online === false) {
    return {
      isOnline: false,
      statusLabel: "Store Closed",
      statusBadge: "offline",
      statusMessage: "Store will remain closed until manually reopened.",
      storeStatus: "closed",
      closureType: "indefinite",
      reopenAtFormatted: null,
      closureMessage: currentSettings.closure_message || null,
      autoReopen: false,
    };
  }

  // 3. STORE OPEN
  return {
    isOnline: true,
    statusLabel: "Store is Open",
    statusBadge: "online",
    statusMessage: "Store is open.",
    storeStatus: "open",
    closureType: null,
    reopenAtFormatted: null,
    closureMessage: null,
    autoReopen: true,
  };
}

let cachedSettings: StoreSettings = readSettings();
let isApiFetchDisabled = false;
let lastApiFetchTime = 0;
const listeners = new Set<() => void>();

// Realtime sync across tabs and devices
if (typeof window !== "undefined") {
  try {
    supabase
      .channel("store_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings" },
        () => {
          fetchStoreSettings(true);
        }
      )
      .subscribe();

    window.addEventListener("focus", () => {
      fetchStoreSettings(true);
    });
  } catch (err) {
    console.error("[store_settings Realtime Sub error]", err);
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
      console.error("[store_settings Fetch Error]", error.message);
      isApiFetchDisabled = true;
    } else if (data) {
      isApiFetchDisabled = false;
      const isOnline = Boolean(data.is_online);
      const manualMode = data.manual_mode !== undefined ? Boolean(data.manual_mode) : false;
      const openingTime = data.opening_time || "09:00:00";

      let storeStatus: "open" | "temporarily_closed" | "closed" = "open";
      let closureType: "temporary" | "indefinite" | null = null;

      if (data.store_status) {
        storeStatus = data.store_status;
        closureType = data.closure_type || (storeStatus === "temporarily_closed" ? "temporary" : storeStatus === "closed" ? "indefinite" : null);
      } else if (!isOnline) {
        if (data.reopen_at) {
          storeStatus = "temporarily_closed";
          closureType = "temporary";
        } else {
          storeStatus = "closed";
          closureType = "indefinite";
        }
      }

      cachedSettings = {
        id: data.id || "global",
        is_online: isOnline,
        store_status: storeStatus,
        closure_type: closureType,
        reopen_at: data.reopen_at || null,
        closure_message: data.closure_message || null,
        auto_reopen: data.auto_reopen ?? true,
        opening_time: openingTime,
        manual_mode: manualMode,
        auto_closed_at: data.auto_closed_at || null,
        updated_at: data.updated_at,
        updated_by: data.updated_by || null,
      };
      writeSettings(cachedSettings);
      listeners.forEach((cb) => cb());
    }
  } catch (err) {
    console.error("[store_settings Fetch Exception]", err);
    isApiFetchDisabled = true;
  }

  return cachedSettings || DEFAULT_SETTINGS;
}

async function saveStoreSettingsRow(fullPayload: StoreSettings): Promise<void> {
  const { data: existingRow } = await supabase
    .from("store_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  const isOnlineBool = Boolean(fullPayload.is_online);
  const manualModeBool = Boolean(fullPayload.manual_mode);

  const basePayload = {
    is_online: isOnlineBool,
    manual_mode: manualModeBool,
    opening_time: fullPayload.opening_time || "09:00:00",
    auto_closed_at: fullPayload.auto_closed_at || null,
    updated_at: fullPayload.updated_at,
  };

  const payloadToSend = {
    ...fullPayload,
    is_online: isOnlineBool,
    manual_mode: manualModeBool,
  };

  const targetId = existingRow?.id || cachedSettings?.id || "global";

  if (existingRow && existingRow.id !== undefined && existingRow.id !== null) {
    const { error: updateError } = await supabase
      .from("store_settings")
      .update(payloadToSend)
      .eq("id", existingRow.id);

    if (updateError) {
      const isColumnError =
        updateError.code === "PGRST204" ||
        updateError.code === "42703" ||
        updateError.message?.includes("column") ||
        updateError.message?.includes("schema cache");

      if (isColumnError) {
        const { error: fallbackErr } = await supabase
          .from("store_settings")
          .update(basePayload)
          .eq("id", existingRow.id);

        if (fallbackErr) {
          console.error("[store_settings fallback update error]", fallbackErr);
          throw fallbackErr;
        }
      } else {
        console.error("[store_settings update error]", updateError);
        throw updateError;
      }
    }
  } else {
    const { error: insertError } = await supabase
      .from("store_settings")
      .insert({ id: targetId, ...payloadToSend });

    if (insertError) {
      const isColumnError =
        insertError.code === "PGRST204" ||
        insertError.code === "42703" ||
        insertError.message?.includes("column") ||
        insertError.message?.includes("schema cache");

      if (isColumnError) {
        const { error: fallbackErr } = await supabase
          .from("store_settings")
          .insert({ id: targetId, ...basePayload });

        if (fallbackErr) {
          console.error("[store_settings fallback insert error]", fallbackErr);
          throw fallbackErr;
        }
      } else {
        console.error("[store_settings insert error]", insertError);
        throw insertError;
      }
    }
  }
}

export async function updateStoreSettings(newMode: "auto" | "online" | "offline" | boolean): Promise<StoreSettings> {
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

  const nowIso = new Date().toISOString();
  const openingTime = cachedSettings?.opening_time || "09:00:00";

  const fullPayload: StoreSettings = {
    is_online: targetOnline,
    store_status: targetOnline ? "open" : "closed",
    closure_type: targetOnline ? null : "indefinite",
    reopen_at: null,
    closure_message: null,
    auto_reopen: targetOnline ? true : false,
    manual_mode: true,
    auto_closed_at: null,
    opening_time: openingTime,
    updated_at: nowIso,
  };

  try {
    await saveStoreSettingsRow(fullPayload);
  } catch (err) {
    console.error("[store_settings Update Exception]", err);
    throw err;
  }

  return await fetchStoreSettings(true);
}

export async function updateStoreClosureSettings(params: {
  store_status: "open" | "temporarily_closed" | "closed";
  closure_type?: "temporary" | "indefinite" | null;
  reopen_at?: string | null;
  closure_message?: string | null;
  auto_reopen?: boolean;
}): Promise<StoreSettings> {
  const isOnline = params.store_status === "open";
  const nowIso = new Date().toISOString();

  let userEmail: string | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    userEmail = data.user?.email || null;
  } catch {
    // ignore
  }

  const fullPayload: StoreSettings = {
    is_online: isOnline,
    store_status: params.store_status,
    closure_type: params.closure_type || (isOnline ? null : "indefinite"),
    reopen_at: params.reopen_at || null,
    closure_message: params.closure_message || null,
    auto_reopen: params.auto_reopen ?? (isOnline ? true : false),
    manual_mode: true,
    auto_closed_at: null,
    opening_time: cachedSettings?.opening_time || "09:00:00",
    updated_at: nowIso,
    updated_by: userEmail,
  };

  try {
    await saveStoreSettingsRow(fullPayload);
  } catch (err) {
    console.error("[store_settings updateStoreClosureSettings error]", err);
    throw err;
  }

  return await fetchStoreSettings(true);
}

export function useStoreStatus() {
  const [settings, setSettings] = useState<StoreSettings>(cachedSettings || DEFAULT_SETTINGS);

  useEffect(() => {
    fetchStoreSettings(true);

    const handleUpdate = () => {
      setSettings({ ...(cachedSettings || DEFAULT_SETTINGS) });
    };

    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
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
