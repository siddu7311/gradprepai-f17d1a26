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
    const upiReference = String(body.upi_reference ?? "").trim();
    const payerPhone = body.payer_phone ? String(body.payer_phone).trim() : null;
    const amount = Number(body.amount ?? 199);

    if (upiReference.length < 6) {
      return json({ error: "Please enter a valid UPI transaction / UTR reference number." }, 400);
    }

    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + 30 * 24 * 60 * 60 * 1000);

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
        status: "approved",
        starts_at: startsAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[SUBMIT-UPI-PAYMENT] insert failed", error);
      return json({ error: error.message }, 500);
    }

    console.log("[SUBMIT-UPI-PAYMENT] Pro activated", { userId: user.id, id: data.id });

    return json({
      success: true,
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
