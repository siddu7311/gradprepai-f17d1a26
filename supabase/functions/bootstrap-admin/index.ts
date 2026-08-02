import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// One-off bootstrap: ensures the ADMIN_EMAILS account exists with the
// configured password and has the admin role.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const email = (Deno.env.get("ADMIN_EMAILS") ?? "").split(",")[0].trim().toLowerCase();
  const password = Deno.env.get("ADMIN_BOOTSTRAP_PASSWORD") ?? "";

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Admin bootstrap not configured" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000, page: 1 });
  let user = (list?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email);

  if (user) {
    await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  } else {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    user = created.user!;
  }

  await supabase
    .from("user_roles")
    .upsert({ user_id: user!.id, role: "admin" }, { onConflict: "user_id,role" });

  return new Response(JSON.stringify({ success: true, user_id: user!.id, email }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});