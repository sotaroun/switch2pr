import { NextResponse } from "next/server";

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
  "first_release_date",
];

const POPULAR_BACKUP_QUERY = `
  fields ${GAME_FIELDS.join(", ")};
  sort total_rating desc;
  limit 30;
`;

type RawGame = {
  id: number;
  name: string;
  summary?: string | null;
  cover?: { image_id?: string | null } | null;
  genres?: Array<{ name?: string | null }> | null;
  platforms?: Array<{ abbreviation?: string | null; name?: string | null }> | null;
  first_release_date?: number | null;
};

export async function GET() {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const { data: featuredRows } = await supabase
      .from("featured_games")
      .select(
        "igdb_id, display_name, visible_on_home, visible_on_category, sort_order, is_new_release, is_popular, is_recommended"
      )
      .order("sort_order", { ascending: true, nullsFirst: false });

    const ids = (featuredRows ?? [])
      .map((row) => Number(row.igdb_id))
      .filter((value) => Number.isFinite(value) && value > 0);

    const igdbQuery = ids.length
      ? `fields ${GAME_FIELDS.join(", ")}; where id = (${ids.join(",")}); limit ${ids.length};`
      : POPULAR_BACKUP_QUERY;

    const igdbResponse = await igdbRequest<RawGame[]>("games", igdbQuery);

    const map = new Map<number, NonNullable<typeof featuredRows>[number]>();
    (featuredRows ?? []).forEach((row) => {
      map.set(Number(row.igdb_id), row);
    });

    const games: Game[] = igdbResponse.map((game) => {
      const config = map.get(game.id);
      return {
        id: String(game.id),
        title: config?.display_name ?? game.name,
        categories: mapGenres(game.genres ?? null),
        iconUrl: buildCoverUrl(game.cover?.image_id ?? undefined),
        summary: game.summary ?? undefined,
        visibleOnHome: config?.visible_on_home ?? false,
        visibleOnCategory: config?.visible_on_category ?? false,
        featuredNewRelease: config?.is_new_release ?? false,
        featuredPopular: config?.is_popular ?? false,
        featuredRecommended: config?.is_recommended ?? false,
        firstReleaseDate: game.first_release_date ?? null,
        platforms: mapPlatforms(game.platforms ?? null),
        displayName: config?.display_name ?? null,
        sortOrder: config?.sort_order ?? null,
      } satisfies Game;
    });

    return NextResponse.json({ games });
  } catch (error) {
    console.error("Failed to fetch admin games", error);
    return NextResponse.json(
      { error: "failed_to_fetch" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const supabase = getSupabaseServiceRoleClient();

  const action = body.action as string | undefined;

  try {
    if (action === "upsert") {
      const igdbId = Number(body.igdbId);
      if (!Number.isFinite(igdbId) || igdbId <= 0) {
        return NextResponse.json({ error: "invalid_igdb_id" }, { status: 400 });
      }

      const payload = {
        igdb_id: igdbId,
        display_name: body.displayName ?? null,
        visible_on_home: Boolean(body.visibleOnHome ?? false),
        visible_on_category: Boolean(body.visibleOnCategory ?? false),
        is_new_release: Boolean(body.featuredNewRelease ?? false),
        is_popular: Boolean(body.featuredPopular ?? false),
        is_recommended: Boolean(body.featuredRecommended ?? false),
        sort_order: typeof body.sortOrder === "number" ? body.sortOrder : null,
      };

      const { error } = await supabase.from("featured_games").upsert(payload, {
        onConflict: "igdb_id",
      });

      if (error) {
        console.error("Failed to upsert featured game", error);
        return NextResponse.json({ error: "failed_to_upsert" }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    if (action === "remove") {
      const igdbId = Number(body.igdbId);
      if (!Number.isFinite(igdbId) || igdbId <= 0) {
        return NextResponse.json({ error: "invalid_igdb_id" }, { status: 400 });
      }

      const { error } = await supabase
        .from("featured_games")
        .delete()
        .eq("igdb_id", igdbId);

      if (error) {
        console.error("Failed to remove featured game", error);
        return NextResponse.json({ error: "failed_to_remove" }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    if (action === "add") {
      const igdbId = Number(body.igdbId);
      if (!Number.isFinite(igdbId) || igdbId <= 0) {
        return NextResponse.json({ error: "invalid_igdb_id" }, { status: 400 });
      }

      const { error } = await supabase.from("featured_games").upsert(
        {
          igdb_id: igdbId,
          display_name: body.displayName ?? null,
          visible_on_home: Boolean(body.visibleOnHome ?? true),
          visible_on_category: Boolean(body.visibleOnCategory ?? true),
          is_new_release: Boolean(body.featuredNewRelease ?? false),
          is_popular: Boolean(body.featuredPopular ?? false),
          is_recommended: Boolean(body.featuredRecommended ?? false),
          sort_order: typeof body.sortOrder === "number" ? body.sortOrder : null,
        },
        { onConflict: "igdb_id" }
      );

      if (error) {
        console.error("Failed to add featured game", error);
        return NextResponse.json({ error: "failed_to_add" }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "unsupported_action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update featured games", error);
    return NextResponse.json({ error: "failed_to_update" }, { status: 500 });
  }
}
