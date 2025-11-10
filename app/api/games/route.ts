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
  "platforms.name",
  "first_release_date",
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
};

const GENRE_TO_CATEGORY: Record<string, GameCategory> = {
  "Role-playing (RPG)": "RPG",
  Adventure: "アクション",
  Action: "アクション",
  Platform: "アクション",
  "Hack and slash/Beat 'em up": "アクション",
  Fighting: "アクション",
  Shooter: "シューター",
  Sport: "スポーツ",
  Racing: "スポーツ",
  Puzzle: "パズル",
  "Quiz/Trivia": "パズル",
  Music: "アクション",
  Simulator: "スポーツ",
  Strategy: "RPG",
  "Real Time Strategy (RTS)": "RPG",
  Tactical: "RPG",
  "Turn-based strategy (TBS)": "RPG",
  Indie: "アクション",
  Arcade: "アクション",
};

const DEFAULT_CATEGORY: GameCategory = "アクション";

function mapGenresToCategories(
  genres: Array<{ name?: string | null }> | null | undefined
): GameCategory[] {
  if (!genres) return [DEFAULT_CATEGORY];

  const mapped = genres
    .map((genre) => {
      const name = genre?.name;
      if (!name) return undefined;
      return GENRE_TO_CATEGORY[name] ?? DEFAULT_CATEGORY;
    })
    .filter((category): category is GameCategory => Boolean(category));

  return mapped.length > 0 ? Array.from(new Set(mapped)) : [DEFAULT_CATEGORY];
}

export async function GET() {
  try {
    let distinctIds: number[] = [];

    try {
      const supabase = getSupabaseServiceRoleClient();
      const { data: gameIdRows, error: supabaseError } = await supabase
        .from("oneliner_reviews")
        .select("game_id")
        .eq("status", "approved");

      if (supabaseError) {
        console.warn("Failed to fetch game ids from Supabase", supabaseError);
      }

      distinctIds = Array.from(
        new Set(
          (gameIdRows ?? [])
            .map((row) => Number(row.game_id))
            .filter((value) => Number.isFinite(value) && value > 0)
        )
      );
    } catch (supabaseError) {
      console.warn(
        "Supabase is not configured. Falling back to popular IGDB games.",
        supabaseError
      );
    }

    // ✅ 固定値を設定
    const limit = 20;
    const offset = 0;

    const igdbQuery =
      distinctIds.length > 0
        ? `
            fields ${GAME_FIELDS.join(", ")};
            where id = (${distinctIds.join(",")});
            limit ${distinctIds.length};
          `
        : POPULAR_GAMES_QUERY;

    const response = await igdbRequest<RawGame[]>("games", igdbQuery);

    const games: Game[] = response.map((game) => ({
      id: String(game.id),
      title: game.name,
      categories: mapGenresToCategories(game.genres ?? null),
      iconUrl: buildCoverUrl(game.cover?.image_id ?? undefined),
      summary: game.summary ?? undefined,
    }));

    return NextResponse.json(
      {
        games,
        hasMore: response.length === limit,
        offset: offset + response.length,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=120",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch games from IGDB", error);
    return NextResponse.json(
      { error: "failed_to_fetch_games" },
      { status: 500 }
    );
  }
}