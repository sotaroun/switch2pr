import { NextResponse } from "next/server";

import { buildCoverUrl, igdbRequest } from "@/lib/api/igdb";
import { getSupabaseServiceRoleClient } from "@/lib/api/supabase";
import type { Game, GameCategory } from "@/types/game";

const GAME_FIELDS = [
  "id",
  "name",
  "summary",
  "cover.image_id",
  "genres.name",
  "total_rating",
  "total_rating_count",
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
};

const GENRE_TO_CATEGORY: Record<string, GameCategory> = {
  "Role-playing (RPG)": "RPG",
  "Adventure": "アクション",
  "Action": "アクション",
  "Platform": "アクション",
  "Hack and slash/Beat 'em up": "アクション",
  "Fighting": "アクション",
  "Shooter": "シューティング",
  "Sport": "スポーツ",
  "Racing": "スポーツ",
  "Puzzle": "パズル",
  "Quiz/Trivia": "パズル",
  "Music": "アクション",
  "Simulator": "スポーツ",
  "Strategy": "RPG",
  "Real Time Strategy (RTS)": "RPG",
  "Tactical": "RPG",
  "Turn-based strategy (TBS)": "RPG",
  "Indie": "アクション",
  "Arcade": "アクション",
};

const DEFAULT_CATEGORY: GameCategory = "アクション";

function mapGenresToCategories(genres: Array<{ name?: string | null }> | null | undefined): GameCategory[] {
  if (!genres) {
    return [DEFAULT_CATEGORY];
  }

  const mapped = genres
    .map((genre) => {
      const name = genre?.name;
      if (!name) return undefined;
      return GENRE_TO_CATEGORY[name] ?? DEFAULT_CATEGORY;
    })
    .filter((category): category is GameCategory => Boolean(category));

  if (mapped.length === 0) {
    return [DEFAULT_CATEGORY];
  }

  return Array.from(new Set(mapped));
}

export async function GET() {
  try {
    const supabase = getSupabaseServiceRoleClient();

    const { data: featuredRows, error: featuredError } = await supabase
      .from("featured_games")
      .select("igdb_id, display_name, visible_on_home, visible_on_category, sort_order")
      .order("sort_order", { ascending: true, nullsFirst: false });

    let targetIds: number[] = [];
    const featuredMap = new Map<
      number,
      {
        display_name?: string | null;
        visible_on_home?: boolean | null;
        visible_on_category?: boolean | null;
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
          categories: mapGenresToCategories(game.genres ?? null),
          iconUrl: buildCoverUrl(game.cover?.image_id ?? undefined),
          summary: game.summary ?? undefined,
          visibleOnHome: config?.visible_on_home ?? !useFeatured,
          visibleOnCategory: config?.visible_on_category ?? !useFeatured,
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
