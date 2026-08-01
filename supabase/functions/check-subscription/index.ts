import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError) {
      const msg = userError.message || "";
      logStep("Auth not available", { message: msg });
      if (msg.toLowerCase().includes("auth session missing")) {
        return new Response(JSON.stringify({ subscribed: false, is_admin: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      throw new Error(`Authentication error: ${userError.message}`);
    }

    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    // Admin emails get automatic Pro access
    const adminEmailsStr = Deno.env.get("ADMIN_EMAILS") || "";
    const adminEmails = adminEmailsStr.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    const isAdmin = adminEmails.includes(user.email.toLowerCase());

    if (isAdmin) {
      const { data: existingRole } = await supabaseClient
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!existingRole) {
        await supabaseClient
          .from("user_roles")
          .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
      }

      return new Response(JSON.stringify({
        subscribed: true,
        product_id: "admin_pro",
        subscription_end: null,
        subscription_id: "admin",
        is_admin: true,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    // Role-based Pro access
    const { data: userRole } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "moderator"])
      .maybeSingle();

    if (userRole) {
      return new Response(JSON.stringify({
        subscribed: true,
        product_id: "role_pro",
        subscription_end: null,
        subscription_id: userRole.role,
        is_admin: userRole.role === "admin",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    // UPI / QR payment based subscription
    const { data: payment, error: paymentError } = await supabaseClient
      .from("upi_payments")
      .select("id, expires_at, plan, status")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (paymentError) throw new Error(paymentError.message);

    if (payment) {
      logStep("Active UPI subscription found", { id: payment.id });
      return new Response(JSON.stringify({
        subscribed: true,
        product_id: "upi_pro",
        subscription_end: payment.expires_at,
        subscription_id: payment.id,
        is_admin: false,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    logStep("No active subscription");
    return new Response(JSON.stringify({
      subscribed: false,
      product_id: null,
      subscription_end: null,
      subscription_id: null,
      is_admin: false,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
