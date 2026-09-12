import { supabase } from "./supabase";

export interface CustomizationRequestParams {
  selectedFile: File;
  customizationType: string;
  title: string;
  quantity: number;
  phone: string;
  customerEmail?: string | undefined;
}

export interface CustomizationRequestResult {
  success: boolean;
  requestId?: string;
  fileUrl?: string | null;
  error?: string;
}

/**
 * Uploads preference file to Supabase Storage ('print-files'), inserts record into 'public.print_requests',
 * and calls the 'send-print-request' Edge Function to deliver email to the shop owner via Resend.
 */
export async function submitCustomizationRequest(
  params: CustomizationRequestParams
): Promise<CustomizationRequestResult> {
  const { selectedFile, customizationType, title, quantity, phone } = params;

  if (!selectedFile) {
    return { success: false, error: "Please select a preference file to upload." };
  }

  if (!customizationType) {
    return { success: false, error: "Please select a customization type." };
  }

  if (!title || !title.trim()) {
    return { success: false, error: "Please enter a title for your customization." };
  }

  if (!quantity || quantity < 1 || !Number.isInteger(quantity)) {
    return { success: false, error: "Please enter a valid quantity (minimum 1)." };
  }

  const cleanPhone = phone ? phone.trim() : "";
  const phoneDigits = cleanPhone.replace(/\D/g, "");
  if (!cleanPhone || phoneDigits.length < 10) {
    return { success: false, error: "Please enter a valid 10-digit phone number." };
  }

  // 1. Authenticated user lookup
  let userId: string | null = null;
  let customerName: string = "Customer";
  let customerEmail: string | null = null;
  let customerPhone: string | null = null;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData?.session?.user;
    if (sessionUser) {
      userId = sessionUser.id;
      customerEmail = sessionUser.email || null;
      customerName = sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || customerEmail?.split("@")[0] || "Customer";
      customerPhone = sessionUser.user_metadata?.phone || sessionUser.phone || null;
    }
  } catch (_e) {
    // ignore
  }

  if (!userId || !customerEmail) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        userId = authData.user.id;
        if (authData.user.email) customerEmail = authData.user.email;
        if (!customerName || customerName === "Customer") {
          customerName = authData.user.user_metadata?.full_name || authData.user.user_metadata?.name || customerEmail?.split("@")[0] || "Customer";
        }
        if (!customerPhone) customerPhone = authData.user.user_metadata?.phone || authData.user.phone || null;
      }
    } catch (_e) {
      // ignore
    }
  }

  if (userId) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profile) {
        if (profile.full_name) customerName = profile.full_name;
        if (profile.phone) customerPhone = profile.phone;
        if (profile.email && !customerEmail) customerEmail = profile.email;
      }
    } catch (_e) {
      // ignore
    }
  }

  if (!customerEmail && params.customerEmail && params.customerEmail.includes("@")) {
    customerEmail = params.customerEmail;
  }

  if (!userId || !customerEmail || customerEmail === "N/A") {
    return {
      success: false,
      error: "Please log in before submitting a customization request.",
    };
  }

  const finalPhone = cleanPhone || customerPhone || "N/A";

  try {
    // 2. Upload file to Supabase Storage bucket 'print-files'
    const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const filePath = `customizations/${Date.now()}_${cleanFileName}`;

    const { data: _uploadData, error: uploadError } = await supabase.storage
      .from("print-files")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("[Customization Request] Storage upload error:", uploadError);
      return { success: false, error: `Failed to upload preference file: ${uploadError.message}` };
    }

    let filePublicUrl: string | null = null;
    try {
      const { data: urlData } = supabase.storage
        .from("print-files")
        .getPublicUrl(filePath);
      filePublicUrl = urlData?.publicUrl || null;
    } catch {
      // ignore
    }

    // 3. Create record in public.print_requests
    let insertedId: string | null = null;

    const { data: insertedRecord, error: insertError } = await supabase
      .from("print_requests")
      .insert({
        user_id: userId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: finalPhone,
        file_name: selectedFile.name,
        file_path: filePath,
        file_url: filePublicUrl,
        print_type: `Customization: ${customizationType}`,
        copies: quantity,
        paper: title.trim(),
        finishing: "Customization",
        total_amount: 0,
        status: "pending",
        email_sent: false,
      })
      .select()
      .maybeSingle();

    if (!insertError && insertedRecord?.id) {
      insertedId = insertedRecord.id;
    } else {
      console.warn("[Customization Request] Direct insert notice, trying RPC:", insertError?.message);
      const { data: rpcData, error: rpcError } = await supabase.rpc("create_print_request", {
        p_user_id: userId,
        p_customer_name: customerName,
        p_customer_email: customerEmail,
        p_customer_phone: finalPhone,
        p_file_name: selectedFile.name,
        p_file_path: filePath,
        p_file_url: filePublicUrl,
        p_print_type: `Customization: ${customizationType}`,
        p_copies: quantity,
        p_paper: title.trim(),
        p_finishing: "Customization",
        p_total_amount: 0,
      });

      if (!rpcError && rpcData && rpcData.length > 0) {
        insertedId = rpcData[0].id;
      } else {
        console.error("[Customization Request] Insert error:", insertError || rpcError);
        return {
          success: false,
          error: `Failed to save customization request: ${insertError?.message || rpcError?.message || "Database insert failed"}`,
        };
      }
    }

    if (!insertedId) {
      return { success: false, error: "Failed to obtain request ID after insert." };
    }

    // 4. Call Supabase Edge Function 'send-print-request' to email shop owner
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const funcPayload = {
      print_request_id: insertedId,
      user_id: userId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: finalPhone,
      file_name: selectedFile.name,
      file_path: filePath,
      file_url: filePublicUrl,
      print_type: `Customization: ${customizationType}`,
      copies: quantity,
      paper: title.trim(),
      finishing: "Customization",
      total_amount: 0,
      customization_type: customizationType,
      title: title.trim(),
      quantity: quantity,
    };

    try {
      const res = await supabase.functions.invoke("send-print-request", {
        body: funcPayload,
        headers,
      });
      if (res.data && res.data.success !== false) {
        await supabase
          .from("print_requests")
          .update({ email_sent: true, updated_at: new Date().toISOString() })
          .eq("id", insertedId);
      }
    } catch (invokeErr) {
      console.warn("[Customization Request] Edge function send-print-request notice:", invokeErr);
    }

    return {
      success: true,
      requestId: insertedId,
      fileUrl: filePublicUrl,
    };
  } catch (err: any) {
    console.error("[Customization Request] Unexpected exception:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred while processing your customization request.",
    };
  }
}
