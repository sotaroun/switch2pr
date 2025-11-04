"use server";

import { NextRequest, NextResponse } from "next/server";

import { buildCoverUrl, igdbRequest } from "@/lib/api/igdb";
import { getSupabaseServiceRoleClient } from "@/lib/api/supabase";
import { mapGenres, mapPlatforms } from "@/lib/gameMetadata";
import type { Game } from "@/types/game";

const GAME_FIELDS = [
  "id",
  "name",
  "summary",
  "cover.image_id",
  "genres.name",
  "platforms.abbreviation",
  "platforms.name",
];

type RawGame = {
  id: number;
  name: string;
  summary?: string | null;
  cover?: { image_id?: string | null } | null;
  genres?: Array<{ name?: string | null }> | null;
  platforms?: Array<{ abbreviation?: string | null; name?: string | null }> | null;
};

const mapToGame = (raw: RawGame): Game => ({
  id: String(raw.id),
  title: raw.name,
  categories: mapGenres(raw.genres ?? null),
  platforms: mapPlatforms(raw.platforms ?? null),
  iconUrl: buildCoverUrl(raw.cover?.image_id ?? undefined),
  summary: raw.summary ?? undefined,
  visibleOnHome: true,
  visibleOnCategory: true,
  displayName: null,
  sortOrder: null,
  featuredNewRelease: false,
  featuredPopular: false,
  featuredRecommended: true,
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const idParam = searchParams.get("igdbId");
  if (!idParam) {
    return NextResponse.json({ error: "missing_igdb_id" }, { status: 400 });
  }

  const igdbId = Number(idParam);
  if (!Number.isInteger(igdbId) || igdbId <= 0) {
    return NextResponse.json({ error: "invalid_igdb_id" }, { status: 400 });
  }

  const query = `fields ${GAME_FIELDS.join(", ")}; where id = ${igdbId}; limit 1;`;

  try {
    const supabase = getSupabaseServiceRoleClient();

    const { data: existing } = await supabase
      .from("featured_games")
      .select("igdb_id, display_name, visible_on_home, visible_on_category, is_new_release, is_popular, is_recommended, sort_order")
      .eq("igdb_id", igdbId)
      .maybeSingle();

    const [raw] = await igdbRequest<RawGame[]>("games", query);
    if (!raw) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const game = mapToGame(raw);

    const payload = {
      igdb_id: igdbId,
      display_name: existing?.display_name ?? null,
      visible_on_home: existing?.visible_on_home ?? true,
      visible_on_category: existing?.visible_on_category ?? true,
      is_new_release: existing?.is_new_release ?? false,
      is_popular: existing?.is_popular ?? false,
      is_recommended: true,
      sort_order: existing?.sort_order ?? null,
    };

    const { error } = await supabase.from("featured_games").upsert(payload, {
      onConflict: "igdb_id",
    });

    if (error) {
      console.error("Failed to upsert featured game from lookup", error);
      return NextResponse.json({ error: "failed_to_upsert", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ game });
  } catch (error) {
    console.error("Failed to lookup game from IGDB", error);
    return NextResponse.json({ error: "lookup_failed" }, { status: 500 });
  }
}
