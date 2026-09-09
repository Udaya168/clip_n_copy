import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface StoreSettings {
  id?: string | number | undefined;
  is_online: boolean;
  opening_time?: string | undefined; // "09:00:00"
  manual_mode?: boolean | "auto" | "online" | "offline" | undefined;
  auto_closed_at?: string | null | undefined;
  updated_at?: string | undefined;
}

const SETTINGS_KEY = "cnc-store-settings-v3";

export const DEFAULT_SETTINGS: StoreSettings = {
  id: "global",
  is_online: true,
  opening_time: "09:00:00",
  manual_mode: false,
  auto_closed_at: null,
};

function getStoreNowDate(): Date {
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const getPart = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);

    const year = getPart("year");
    const month = getPart("month") - 1;
    const day = getPart("day");
    let hour = getPart("hour");
    if (hour === 24) hour = 0;
    const minute = getPart("minute");
    const second = getPart("second");

    return new Date(year, month, day, hour, minute, second);
  } catch (e) {
    return now;
  }
}

function readSettings(): StoreSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
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
}

export function evaluateStoreStatus(settings?: StoreSettings | null): EvaluatedStoreStatus {
  const currentSettings = settings || DEFAULT_SETTINGS;
  const now = getStoreNowDate();

  // Today 9:00 PM threshold in store timezone (IST UTC+5:30)
  const today9PM = new Date(now);
  today9PM.setHours(21, 0, 0, 0);

  const isAfter9PM = now.getTime() >= today9PM.getTime();

  // 1. AT OR AFTER 9:00 PM TODAY
  if (isAfter9PM) {
    const updatedAtTime = currentSettings.updated_at
      ? new Date(currentSettings.updated_at).getTime()
      : 0;

    // Check if owner manually turned store ON AFTER today's 9:00 PM
    const isManualReopenAfter9PM =
      currentSettings.is_online === true &&
      (currentSettings.manual_mode === true || currentSettings.manual_mode === "online") &&
      !currentSettings.auto_closed_at &&
      updatedAtTime >= today9PM.getTime();

    if (isManualReopenAfter9PM) {
      return {
        isOnline: true,
        statusLabel: "Store is Open (Reopened)",
        statusBadge: "online",
        statusMessage: "Store manually reopened after 9:00 PM.",
      };
    }

    // Check if owner manually turned store OFF after 9 PM
    if (
      currentSettings.is_online === false &&
      (currentSettings.manual_mode === true || currentSettings.manual_mode === "offline") &&
      updatedAtTime >= today9PM.getTime()
    ) {
      return {
        isOnline: false,
        statusLabel: "Store is Closed",
        statusBadge: "offline",
        statusMessage: "Store manually closed.",
      };
    }

    // Otherwise automatically closed at 9:00 PM today
    return {
      isOnline: false,
      statusLabel: "Closed at 9:00 PM",
      statusBadge: "offline",
      statusMessage: "Store automatically closed at 9:00 PM. You can manually reopen it.",
    };
  }

  // 2. BEFORE 9:00 PM TODAY
  if (
    currentSettings.is_online === false ||
    currentSettings.manual_mode === "offline"
  ) {
    return {
      isOnline: false,
      statusLabel: "Store is Closed",
      statusBadge: "offline",
      statusMessage: "Store manually closed.",
    };
  }

  return {
    isOnline: true,
    statusLabel: "Store is Open",
    statusBadge: "online",
    statusMessage: "Store is open.",
  };
}

let cachedSettings: StoreSettings = readSettings();
let isApiFetchDisabled = false;
let lastApiFetchTime = 0;
const listeners = new Set<() => void>();

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const now = Date.now();
  if (isApiFetchDisabled && now - lastApiFetchTime < 60000) {
    return cachedSettings || DEFAULT_SETTINGS;
  }
  if (now - lastApiFetchTime < 2000) {
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
      console.error("[store_settings Fetch Error]", error.message, error);
      isApiFetchDisabled = true;
    } else if (data) {
      isApiFetchDisabled = false;
      const openingTime = data.opening_time || data.openingTime || data.startTime || "09:00:00";
      const isOnline = data.is_online ?? true;
      const manualMode = typeof data.manual_mode === "boolean" ? data.manual_mode : data.manual_mode === "online" || data.manual_mode === "offline";

      cachedSettings = {
        id: data.id || "global",
        is_online: isOnline,
        opening_time: openingTime,
        manual_mode: manualMode,
        auto_closed_at: data.auto_closed_at || null,
        updated_at: data.updated_at,
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

  // Requirement 1 & 4:
  // When owner manually changes store status:
  // - is_online = targetOnline
  // - manual_mode = true (boolean)
  // - auto_closed_at = null
  const updatePayload = {
    is_online: targetOnline,
    manual_mode: true,
    auto_closed_at: null,
    opening_time: openingTime,
    updated_at: nowIso,
  };

  try {
    // 1. Fetch existing store_settings row to get exact row ID
    const { data: existingRow, error: checkError } = await supabase
      .from("store_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error("[store_settings Check Error]", checkError.message, checkError);
    }

    if (existingRow && existingRow.id !== undefined && existingRow.id !== null) {
      // 2. Requirement 1 & 2: UPDATE existing row using .eq('id', existingRow.id)
      const { data: updatedRow, error: updateError } = await supabase
        .from("store_settings")
        .update(updatePayload)
        .eq("id", existingRow.id)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error("[store_settings Update Error]", updateError.message, updateError);
      } else if (updatedRow) {
        isApiFetchDisabled = false;
      }
    } else {
      // 3. Requirement 5: Only INSERT if no row exists
      const { data: insertedRow, error: insertError } = await supabase
        .from("store_settings")
        .insert({
          id: cachedSettings?.id || "global",
          ...updatePayload,
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error("[store_settings Insert Error]", insertError.message, insertError);
      } else if (insertedRow) {
        isApiFetchDisabled = false;
      }
    }
  } catch (err) {
    console.error("[store_settings Update Exception]", err);
  }

  // Requirement 9: Refresh store_settings after every successful status update
  return await fetchStoreSettings();
}

export function useStoreStatus() {
  const [settings, setSettings] = useState<StoreSettings>(cachedSettings || DEFAULT_SETTINGS);

  useEffect(() => {
    fetchStoreSettings();

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
    updateMode: updateStoreSettings,
    updateStatus: updateStoreSettings,
    refresh: fetchStoreSettings,
  };
}
