import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const payerPhone = body.payer_phone ? String(body.payer_phone).replace(/\D/g, "").slice(-10) : null;

    // Amount and plan are fixed server-side — never trusted from the client.
    const amount = 199;

    // A static QR cannot send a trusted payment confirmation to this function.
    // Never create an approved payment from a user's button click.
    const upiReference = `PENDING-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

    // Return any subscription that was previously verified by an administrator/provider.
    const { data: active } = await supabase
      .from("upi_payments")
      .select("id, starts_at, expires_at, upi_reference")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (active) {
      return json({
        success: true,
        already_active: true,
        payment_id: active.id,
        email: user.email,
        amount,
        upi_reference: active.upi_reference,
        starts_at: active.starts_at,
        expires_at: active.expires_at,
      });
    }

    const { data, error } = await supabase
      .from("upi_payments")
      .insert({
        user_id: user.id,
        email: user.email,
        amount,
        currency: "INR",
        plan: "pro",
        upi_reference: upiReference,
        payer_phone: payerPhone,
        status: "pending",
        starts_at: new Date().toISOString(),
        expires_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[SUBMIT-UPI-PAYMENT] insert failed", error);
      return json({ error: error.message }, 500);
    }

    console.log("[SUBMIT-UPI-PAYMENT] Verification requested", { userId: user.id, id: data.id });

    return json({
      success: false,
      pending: true,
      message: "Payment verification is pending. Pro has not been activated.",
      payment_id: data.id,
      email: user.email,
      amount,
      upi_reference: upiReference,
      starts_at: data.starts_at,
      expires_at: data.expires_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[SUBMIT-UPI-PAYMENT] ERROR", message);
    return json({ error: message }, 500);
  }
});
