import { supabase } from "./supabase";

export interface UserAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string; // House / Flat / Building
  address_line2: string; // Street / Area
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  address_type?: string | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export type AddressInput = Omit<UserAddress, "id" | "user_id" | "created_at" | "updated_at">;

const FALLBACK_KEY_PREFIX = "clip_n_copy_user_addresses_";

function getFallbackAddresses(userId: string): UserAddress[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = localStorage.getItem(`${FALLBACK_KEY_PREFIX}${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveFallbackAddresses(userId: string, addresses: UserAddress[]) {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(`${FALLBACK_KEY_PREFIX}${userId}`, JSON.stringify(addresses));
  } catch (e) {
    console.error("[AddressStore] Failed to save fallback addresses:", e);
  }
}

/**
 * Fetch all addresses belonging to the authenticated user.
 * Queries Supabase `addresses` table, with seamless fallback to localStorage if table is not yet created.
 */
export async function fetchUserAddresses(userId: string): Promise<{ data: UserAddress[]; error: Error | null }> {
  if (!userId) return { data: [], error: null };

  try {
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[AddressStore] Supabase fetch warning:", error.message);
      // Fallback to localStorage if table does not exist (PGRST205) or RLS issues
      const localData = getFallbackAddresses(userId);
      return { data: localData, error: null };
    }

    const sbData = ((data as any[]) || []).map((row) => ({
      ...row,
      address_line1: row.address_line1 || row.house_flat || "",
      address_line2: row.address_line2 || row.street_area || "",
    })) as UserAddress[];
    // Sync local fallback with Supabase data if available
    saveFallbackAddresses(userId, sbData);
    return { data: sbData, error: null };
  } catch (err: any) {
    const localData = getFallbackAddresses(userId);
    return { data: localData, error: null };
  }
}

/**
 * Add a new address row for the user without overwriting existing addresses.
 */
export async function addUserAddress(
  userId: string,
  input: AddressInput
): Promise<{ data: UserAddress | null; error: Error | null }> {
  if (!userId) return { data: null, error: new Error("User ID missing") };

  const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `addr_${Date.now()}`;
  
  // Check fallback count to see if this is the first address
  const localExisting = getFallbackAddresses(userId);
  const isFirstAddress = localExisting.length === 0;
  const shouldBeDefault = input.is_default || isFirstAddress;

  const newAddressRecord: UserAddress = {
    id: newId,
    user_id: userId,
    full_name: input.full_name.trim(),
    phone: input.phone.trim(),
    address_line1: input.address_line1.trim(),
    address_line2: input.address_line2.trim(),
    landmark: input.landmark ? input.landmark.trim() : null,
    city: input.city.trim(),
    state: input.state.trim(),
    pincode: input.pincode.trim(),
    country: (input.country || "India").trim(),
    address_type: input.address_type || "Home",
    is_default: shouldBeDefault,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    // If setting as default, clear existing default flags first
    if (shouldBeDefault) {
      await supabase
        .from("addresses")
        .update({ is_default: false, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    }

    // Insert new address row into Supabase
    const { data: inserted, error } = await supabase
      .from("addresses")
      .insert({
        id: newAddressRecord.id,
        user_id: userId,
        full_name: newAddressRecord.full_name,
        phone: newAddressRecord.phone,
        address_line1: newAddressRecord.address_line1,
        address_line2: newAddressRecord.address_line2,
        house_flat: newAddressRecord.address_line1,
        street_area: newAddressRecord.address_line2,
        landmark: newAddressRecord.landmark,
        city: newAddressRecord.city,
        state: newAddressRecord.state,
        pincode: newAddressRecord.pincode,
        country: newAddressRecord.country,
        address_type: newAddressRecord.address_type,
        is_default: shouldBeDefault,
        updated_at: newAddressRecord.updated_at,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.warn("[AddressStore] Supabase insert warning (using fallback):", error.message);
    }

    // Always update local fallback store so UI displays immediately
    let updatedLocal = getFallbackAddresses(userId);
    if (shouldBeDefault) {
      updatedLocal = updatedLocal.map((a) => ({ ...a, is_default: false }));
    }
    const finalRecord = (inserted as UserAddress) || newAddressRecord;
    updatedLocal.unshift(finalRecord);
    saveFallbackAddresses(userId, updatedLocal);

    return { data: finalRecord, error: null };
  } catch (err: any) {
    // Fallback store insert
    let updatedLocal = getFallbackAddresses(userId);
    if (shouldBeDefault) {
      updatedLocal = updatedLocal.map((a) => ({ ...a, is_default: false }));
    }
    updatedLocal.unshift(newAddressRecord);
    saveFallbackAddresses(userId, updatedLocal);

    return { data: newAddressRecord, error: null };
  }
}

/**
 * Update an existing address by matching address ID and user ID.
 */
export async function updateUserAddress(
  addressId: string,
  userId: string,
  input: AddressInput
): Promise<{ data: UserAddress | null; error: Error | null }> {
  if (!userId || !addressId) return { data: null, error: new Error("Missing parameters") };

  const updatedRecord: UserAddress = {
    id: addressId,
    user_id: userId,
    full_name: input.full_name.trim(),
    phone: input.phone.trim(),
    address_line1: input.address_line1.trim(),
    address_line2: input.address_line2.trim(),
    landmark: input.landmark ? input.landmark.trim() : null,
    city: input.city.trim(),
    state: input.state.trim(),
    pincode: input.pincode.trim(),
    country: (input.country || "India").trim(),
    is_default: input.is_default,
    updated_at: new Date().toISOString(),
  };

  try {
    if (input.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    }

    const { data: updated, error } = await supabase
      .from("addresses")
      .update({
        full_name: updatedRecord.full_name,
        phone: updatedRecord.phone,
        address_line1: updatedRecord.address_line1,
        address_line2: updatedRecord.address_line2,
        landmark: updatedRecord.landmark,
        city: updatedRecord.city,
        state: updatedRecord.state,
        pincode: updatedRecord.pincode,
        country: updatedRecord.country,
        is_default: input.is_default,
        updated_at: updatedRecord.updated_at,
      })
      .eq("id", addressId)
      .eq("user_id", userId)
      .select()
      .maybeSingle();

    if (error) {
      console.warn("[AddressStore] Supabase update warning:", error.message);
    }

    // Update fallback store
    let local = getFallbackAddresses(userId);
    if (input.is_default) {
      local = local.map((a) => ({ ...a, is_default: false }));
    }
    const finalRecord = (updated as UserAddress) || updatedRecord;
    local = local.map((a) => (a.id === addressId ? finalRecord : a));
    saveFallbackAddresses(userId, local);

    return { data: finalRecord, error: null };
  } catch (err: any) {
    let local = getFallbackAddresses(userId);
    if (input.is_default) {
      local = local.map((a) => ({ ...a, is_default: false }));
    }
    local = local.map((a) => (a.id === addressId ? updatedRecord : a));
    saveFallbackAddresses(userId, local);

    return { data: updatedRecord, error: null };
  }
}

/**
 * Set a specific address as default while clearing default flag on all others.
 */
export async function setDefaultUserAddress(
  addressId: string,
  userId: string
): Promise<{ error: Error | null }> {
  if (!userId || !addressId) return { error: new Error("Missing parameters") };

  try {
    await supabase
      .from("addresses")
      .update({ is_default: false, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq("id", addressId)
      .eq("user_id", userId);

    if (error) {
      console.warn("[AddressStore] Supabase setDefault warning:", error.message);
    }

    // Update fallback store
    let local = getFallbackAddresses(userId);
    local = local.map((a) => ({
      ...a,
      is_default: a.id === addressId,
    }));
    saveFallbackAddresses(userId, local);

    return { error: null };
  } catch (err: any) {
    let local = getFallbackAddresses(userId);
    local = local.map((a) => ({
      ...a,
      is_default: a.id === addressId,
    }));
    saveFallbackAddresses(userId, local);

    return { error: null };
  }
}

/**
 * Delete a specific address. If it was default, promote another address to default.
 */
export async function deleteUserAddress(
  addressId: string,
  userId: string
): Promise<{ error: Error | null }> {
  if (!userId || !addressId) return { error: new Error("Missing parameters") };

  try {
    let local = getFallbackAddresses(userId);
    const target = local.find((a) => a.id === addressId);
    const wasDefault = target?.is_default ?? false;

    // Delete from Supabase
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId)
      .eq("user_id", userId);

    if (error) {
      console.warn("[AddressStore] Supabase delete warning:", error.message);
    }

    // Delete from fallback store
    local = local.filter((a) => a.id !== addressId);
    if (wasDefault && local.length > 0 && local[0]) {
      local[0].is_default = true;
      await setDefaultUserAddress(local[0].id, userId);
    } else {
      saveFallbackAddresses(userId, local);
    }

    return { error: null };
  } catch (err: any) {
    let local = getFallbackAddresses(userId);
    const target = local.find((a) => a.id === addressId);
    const wasDefault = target?.is_default ?? false;
    local = local.filter((a) => a.id !== addressId);

    if (wasDefault && local.length > 0 && local[0]) {
      local[0].is_default = true;
    }
    saveFallbackAddresses(userId, local);

    return { error: null };
  }
}

/**
 * Formats a UserAddress object into a readable display string.
 */
export function formatAddressString(addr?: UserAddress | null): string {
  if (!addr) return "Add your delivery address";

  const lines = [
    addr.address_line1,
    addr.address_line2,
    addr.landmark ? `Near ${addr.landmark}` : null,
    `${addr.city}, ${addr.state} - ${addr.pincode}`,
    addr.country !== "India" ? addr.country : null,
  ].filter(Boolean);

  return lines.join(", ");
}
