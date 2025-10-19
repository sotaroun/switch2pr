import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

type ReviewActionRequest = {
  reviewId?: string;
  action?: "approve" | "reject";
  note?: string | null;
  actor?: string | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "server_not_configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const payload = (await req.json()) as ReviewActionRequest;
  if (!payload.reviewId || (payload.action !== "approve" && payload.action !== "reject")) {
    return new Response(JSON.stringify({ error: "invalid_payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const now = new Date().toISOString();

  const updates =
    payload.action === "approve"
      ? {
          status: "approved",
          approved_at: now,
          admin_note: payload.note ?? null,
          updated_at: now,
        }
      : {
          status: "rejected",
          approved_at: null,
          admin_note: payload.note ?? null,
          updated_at: now,
        };

  const { error: updateError } = await supabase
    .from("oneliner_reviews")
    .update(updates)
    .eq("id", payload.reviewId);

  if (updateError) {
    console.error("Failed to update review", updateError);
    return new Response(JSON.stringify({ error: "update_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: review, error: fetchError } = await supabase
    .from("oneliner_reviews")
    .select("id, game_id, user_name, rating, comment, status, approved_at, admin_note")
    .eq("id", payload.reviewId)
    .single();

  if (fetchError || !review) {
    console.error("Failed to fetch review after update", fetchError);
    return new Response(JSON.stringify({ error: "fetch_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      review,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
