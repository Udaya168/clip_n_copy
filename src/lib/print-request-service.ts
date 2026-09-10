import { supabase } from "./supabase";

export interface PrintRequestParams {
  selectedFile: File;
  printType: string;
  copies: number;
  paper: string;
  finishing: string;
  totalAmount: number;
}

export interface PrintRequestResult {
  success: boolean;
  requestId?: string;
  fileUrl?: string | null;
  error?: string;
}

/**
 * Uploads document to Supabase Storage ('print-files'), inserts record into 'public.print_requests',
 * and calls the 'send-print-request' Supabase Edge Function to deliver email with attachment via Resend.
 */
export async function submitPrintRequest(params: PrintRequestParams): Promise<PrintRequestResult> {
  const { selectedFile, printType, copies, paper, finishing, totalAmount } = params;

  if (!selectedFile) {
    return { success: false, error: "Please select a file to upload." };
  }

  // 1. Get authenticated user details if available
  let userId: string | null = null;
  let customerName: string = "Customer";
  let customerEmail: string | null = null;
  let customerPhone: string | null = null;

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      userId = authData.user.id;
      customerEmail = authData.user.email || null;
      customerName = authData.user.user_metadata?.full_name || authData.user.user_metadata?.name || customerEmail?.split("@")[0] || "Customer";
      customerPhone = authData.user.user_metadata?.phone || authData.user.phone || null;

      // Try fetching profile for updated name/phone
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profile) {
        if (profile.full_name) customerName = profile.full_name;
        if (profile.phone) customerPhone = profile.phone;
        if (profile.email) customerEmail = profile.email;
      }
    }
  } catch (_e) {
    // ignore auth lookup error
  }

  try {
    // 2. Upload file to Supabase Storage bucket 'print-files'
    const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const filePath = `print_requests/${Date.now()}_${cleanFileName}`;

    const { data: _uploadData, error: uploadError } = await supabase.storage
      .from("print-files")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("[Print Request] Storage upload error:", uploadError);
      return { success: false, error: `Failed to upload file: ${uploadError.message}` };
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
        customer_phone: customerPhone,
        file_name: selectedFile.name,
        file_path: filePath,
        file_url: filePublicUrl,
        print_type: printType,
        copies: copies,
        paper: paper,
        finishing: finishing || "None",
        total_amount: totalAmount,
        status: "pending",
        email_sent: false,
      })
      .select()
      .maybeSingle();

    if (!insertError && insertedRecord?.id) {
      insertedId = insertedRecord.id;
    } else {
      console.warn("[Print Request] Direct insert notice, trying RPC:", insertError?.message);
      const { data: rpcData, error: rpcError } = await supabase.rpc("create_print_request", {
        p_user_id: userId,
        p_customer_name: customerName,
        p_customer_email: customerEmail,
        p_customer_phone: customerPhone,
        p_file_name: selectedFile.name,
        p_file_path: filePath,
        p_file_url: filePublicUrl,
        p_print_type: printType,
        p_copies: copies,
        p_paper: paper,
        p_finishing: finishing || "None",
        p_total_amount: totalAmount,
      });

      if (!rpcError && rpcData && rpcData.length > 0) {
        insertedId = rpcData[0].id;
      } else {
        console.error("[Print Request] Insert error:", insertError || rpcError);
        return {
          success: false,
          error: `Failed to save print request: ${insertError?.message || rpcError?.message || "Database insert failed"}`,
        };
      }
    }

    if (!insertedId) {
      return { success: false, error: "Failed to obtain print request ID after insert." };
    }

    // 4. Duplicate protection check
    const { data: existingCheck } = await supabase
      .from("print_requests")
      .select("email_sent")
      .eq("id", insertedId)
      .maybeSingle();

    if (existingCheck?.email_sent === true) {
      console.log(`[Print Request] Email already sent for print request ${insertedId}.`);
      return {
        success: true,
        requestId: insertedId,
        fileUrl: filePublicUrl,
      };
    }

    // 5. Call Supabase Edge Function 'send-print-request'
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
      customer_phone: customerPhone,
      file_name: selectedFile.name,
      file_path: filePath,
      file_url: filePublicUrl,
      print_type: printType,
      copies: copies,
      paper: paper,
      finishing: finishing || "None",
      total_amount: totalAmount,
    };

    let funcData: any = null;
    let funcError: any = null;

    try {
      const res = await supabase.functions.invoke("send-print-request", {
        body: funcPayload,
        headers,
      });
      funcData = res.data;
      funcError = res.error;
    } catch (invokeErr) {
      console.warn("[Print Request] Edge Function send-print-request invocation notice, trying fallback:", invokeErr);
      const res = await supabase.functions.invoke("send-print-request-email", {
        body: { ...funcPayload, requestId: insertedId },
        headers,
      });
      funcData = res.data;
      funcError = res.error;
    }

    if (funcError || (funcData && funcData.success === false)) {
      console.error("[Print Request] Edge Function send-print-request error:", funcError || funcData);
      return {
        success: false,
        requestId: insertedId,
        fileUrl: filePublicUrl,
        error: funcError?.message || funcData?.error || funcData?.message || "Failed to deliver email to store staff via Resend.",
      };
    }

    // 6. Update email_sent = true after Edge Function confirms success
    await supabase
      .from("print_requests")
      .update({ email_sent: true, updated_at: new Date().toISOString() })
      .eq("id", insertedId);

    return {
      success: true,
      requestId: insertedId,
      fileUrl: filePublicUrl,
    };
  } catch (err: any) {
    console.error("[Print Request] Unexpected exception:", err);
    return { success: false, error: err.message || "An unexpected error occurred while processing your print request." };
  }
}
