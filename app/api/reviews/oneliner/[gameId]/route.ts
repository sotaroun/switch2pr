import { NextResponse } from "next/server";

import { getSupabaseServiceRoleClient } from "@/lib/api/supabase";
import type { OverlayComment } from "@/types/overlayComment";

export async function GET(_req: Request, ctx: { params: Promise<{ gameId: string }> }) {
  const params = await ctx.params;
  const gameId = params.gameId;
  if (!gameId) {
    return NextResponse.json({ error: "game_id_missing" }, { status: 400 });
  }

  const supabase = getSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("oneliner_reviews")
    .select("id, comment, created_at")
    .eq("game_id", gameId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to fetch oneliner reviews", error);
    return NextResponse.json({ error: "failed_to_fetch", message: error.message }, { status: 500 });
  }

  const comments: OverlayComment[] = (data ?? []).map((item) => ({
    id: item.id,
    content: item.comment ?? "",
    createdAt: item.created_at ?? new Date().toISOString(),
  })).filter((item) => item.content.length > 0);

  return NextResponse.json(comments, {
    headers: {
      "Cache-Control": "public, max-age=30",
    },
  });
}
