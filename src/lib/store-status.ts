import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface StoreSettings {
  id?: string | number | undefined;
  is_online: boolean;
  opening_time: string; // "09:00:00" or "09:00"
  startTime?: string | undefined;
  openingTime?: string | undefined;
  manual_mode?: "auto" | "online" | "offline" | undefined;
  updated_at?: string | undefined;
}

const SETTINGS_KEY = "cnc-store-settings-v1";

export const DEFAULT_SETTINGS: StoreSettings = {
  id: "global",
  is_online: true,
  opening_time: "09:00:00",
  startTime: "09:00:00",
  openingTime: "09:00:00",
  manual_mode: "auto",
};

function readSettings(): StoreSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const openingTime = parsed.opening_time || parsed.openingTime || parsed.startTime || "09:00:00";
    return {
      ...parsed,
      opening_time: openingTime,
      startTime: openingTime,
      openingTime: openingTime,
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

export function evaluateStoreStatus(settings?: StoreSettings | null): {
  isOnline: boolean;
  statusLabel: string;
  statusBadge: "online" | "offline" | "before_opening";
} {
  const currentSettings = settings || DEFAULT_SETTINGS;

  // 1. Check explicit is_online false / manual offline
  if (currentSettings.is_online === false || currentSettings.manual_mode === "offline") {
    return {
      isOnline: false,
      statusLabel: "Store is Closed",
      statusBadge: "offline",
    };
  }

  // 2. Check explicit manual online override
  if (currentSettings.manual_mode === "online") {
    return {
      isOnline: true,
      statusLabel: "Store is Open",
      statusBadge: "online",
    };
  }

  // 3. Auto mode: check opening_time / startTime / openingTime (default "09:00:00")
  const rawOpeningTime =
    currentSettings.opening_time ||
    currentSettings.startTime ||
    currentSettings.openingTime ||
    "09:00:00";

  const parts = String(rawOpeningTime).split(":");
  const openH = Number(parts[0]) || 9;
  const openM = Number(parts[1]) || 0;

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  const openTimeInMinutes = openH * 60 + openM;
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  if (currentTimeInMinutes < openTimeInMinutes) {
    return {
      isOnline: false,
      statusLabel: "Opens at 9:00 AM",
      statusBadge: "before_opening",
    };
  }

  return {
    isOnline: true,
    statusLabel: "Store is Open",
    statusBadge: "online",
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
  if (now - lastApiFetchTime < 5000) {
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
      console.warn("[store_settings Notice] Using local fallback store settings.");
      isApiFetchDisabled = true;
    } else if (data) {
      isApiFetchDisabled = false;
      const openingTime = data.opening_time || data.openingTime || data.startTime || "09:00:00";
      const isOnline = data.is_online ?? (data.manual_mode === "offline" ? false : true);

      cachedSettings = {
        id: data.id || "global",
        is_online: isOnline,
        opening_time: openingTime,
        startTime: openingTime,
        openingTime: openingTime,
        manual_mode: data.manual_mode || (isOnline === false ? "offline" : "auto"),
        updated_at: data.updated_at,
      };
      writeSettings(cachedSettings);
      listeners.forEach((cb) => cb());
    }
  } catch (err) {
    isApiFetchDisabled = true;
  }

  return cachedSettings || DEFAULT_SETTINGS;
}

export async function updateStoreSettings(newMode: "auto" | "online" | "offline" | boolean): Promise<StoreSettings> {
  let isOnline = true;
  let manualMode: "auto" | "online" | "offline" = "auto";

  if (typeof newMode === "boolean") {
    isOnline = newMode;
    manualMode = newMode ? "online" : "offline";
  } else if (newMode === "online") {
    isOnline = true;
    manualMode = "online";
  } else if (newMode === "offline") {
    isOnline = false;
    manualMode = "offline";
  } else {
    isOnline = true;
    manualMode = "auto";
  }

  const openingTime = cachedSettings?.opening_time || cachedSettings?.startTime || "09:00:00";

  const updated: StoreSettings = {
    id: cachedSettings?.id || "global",
    is_online: isOnline,
    manual_mode: manualMode,
    opening_time: openingTime,
    startTime: openingTime,
    openingTime: openingTime,
    updated_at: new Date().toISOString(),
  };

  cachedSettings = updated;
  writeSettings(updated);
  listeners.forEach((cb) => cb());

  try {
    const { error: updateError } = await supabase
      .from("store_settings")
      .update({
        is_online: isOnline,
        opening_time: openingTime,
        updated_at: updated.updated_at,
      })
      .limit(1);

    if (updateError) {
      await supabase
        .from("store_settings")
        .upsert({
          id: cachedSettings?.id || "global",
          is_online: isOnline,
          opening_time: openingTime,
          manual_mode: manualMode,
          updated_at: updated.updated_at,
        });
    } else {
      isApiFetchDisabled = false;
    }
  } catch (err) {
    console.warn("Supabase store_settings update exception:", err);
  }

  return updated;
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
    updateMode: updateStoreSettings,
    refresh: fetchStoreSettings,
  };
}
