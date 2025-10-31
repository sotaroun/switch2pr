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
  "total_rating",
  "total_rating_count",
  "platforms.abbreviation",
  "platforms.name",
];

const POPULAR_GAMES_QUERY = `
  fields ${GAME_FIELDS.join(", ")};
  where total_rating != null & total_rating_count > 20;
  sort total_rating desc;
  limit 20;
`;

type RawGame = {
  id: number;
  name: string;
  summary?: string | null;
  cover?: { image_id?: string | null } | null;
  genres?: Array<{ name?: string | null }> | null;
  platforms?: Array<{ abbreviation?: string | null; name?: string | null }> | null;
};

export async function GET() {
  try {
    const supabase = getSupabaseServiceRoleClient();

    const { data: featuredRows, error: featuredError } = await supabase
      .from("featured_games")
      .select(
        "igdb_id, display_name, visible_on_home, visible_on_category, sort_order, is_new_release, is_popular, is_recommended"
      )
      .order("sort_order", { ascending: true, nullsFirst: false });

    let targetIds: number[] = [];
    const featuredMap = new Map<
      number,
      {
        display_name?: string | null;
        visible_on_home?: boolean | null;
        visible_on_category?: boolean | null;
        is_new_release?: boolean | null;
        is_popular?: boolean | null;
        is_recommended?: boolean | null;
        sort_order?: number | null;
      }
    >();

    if (!featuredError && featuredRows && featuredRows.length > 0) {
      targetIds = featuredRows
        .map((row) => Number(row.igdb_id))
        .filter((value) => Number.isFinite(value) && value > 0);

      featuredRows.forEach((row) => {
        featuredMap.set(Number(row.igdb_id), {
          display_name: row.display_name,
          visible_on_home: row.visible_on_home,
          visible_on_category: row.visible_on_category,
          is_new_release: row.is_new_release,
          is_popular: row.is_popular,
          is_recommended: row.is_recommended,
          sort_order: row.sort_order,
        });
      });
    }

    const useFeatured = targetIds.length > 0;

    const igdbQuery = useFeatured
      ? `
          fields ${GAME_FIELDS.join(", ")};
          where id = (${targetIds.join(",")});
          limit ${targetIds.length};
        `
      : POPULAR_GAMES_QUERY;

    const response = await igdbRequest<RawGame[]>("games", igdbQuery);

    const games: Game[] = response
      .map((game) => {
        const config = featuredMap.get(game.id);
        return {
          id: String(game.id),
          title: config?.display_name ?? game.name,
          categories: mapGenres(game.genres ?? null),
          platforms: mapPlatforms(game.platforms ?? null),
          iconUrl: buildCoverUrl(game.cover?.image_id ?? undefined),
          summary: game.summary ?? undefined,
          visibleOnHome: config?.visible_on_home ?? !useFeatured,
          visibleOnCategory: config?.visible_on_category ?? !useFeatured,
          featuredNewRelease: config?.is_new_release ?? false,
          featuredPopular: config?.is_popular ?? false,
          featuredRecommended: config?.is_recommended ?? false,
          displayName: config?.display_name ?? null,
          sortOrder: config?.sort_order ?? null,
        } satisfies Game;
      })
      .sort((a, b) => {
        const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
        if (orderA === orderB) {
          return a.title.localeCompare(b.title);
        }
        return orderA - orderB;
      });

    return NextResponse.json(games, {
      headers: {
        "Cache-Control": "public, max-age=120",
      },
    });
  } catch (error) {
    console.error("Failed to fetch games from IGDB", error);
    return NextResponse.json(
      { error: "failed_to_fetch_games" },
      { status: 500 }
    );
  }
}
