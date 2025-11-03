import { NextResponse, type NextRequest } from "next/server";

import { buildCoverUrl, igdbRequest } from "@/lib/api/igdb";
import { getSupabaseServiceRoleClient } from "@/lib/api/supabase";
import type { Game, GameCategory, GamePlatform } from "@/types/game";

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
  platforms?: Array<{ name?: string | null }> | null;
  first_release_date?: number | null;
};

const GENRE_TO_CATEGORY: Record<string, GameCategory> = {
  "Role-playing (RPG)": "RPG",
  "Adventure": "アドベンチャー",
  "Action": "アクション",
  "Platform": "プラットフォーム",
  "Hack and slash/Beat 'em up": "ハクスラ",
  "Fighting": "対戦格闘",
  "Shooter": "シューター",
  "Sport": "スポーツ",
  "Racing": "レース",
  "Puzzle": "パズル",
  "Quiz/Trivia": "クイズ",
  "Music": "音楽",
  "Simulator": "シミュレーター",
  "Strategy": "ストラテジー",
  "Real Time Strategy (RTS)": "RTS",
  "Tactical": "タクティカル",
  "Turn-based strategy (TBS)": "SRPG",
  "Indie": "インディー",
  "Arcade": "アーケード",
};

const PLATFORM_NAME_MAP: Record<string, GamePlatform> = {
  "Nintendo Switch": "Nintendo Switch",
  "PC (Microsoft Windows)": "PC(Windows)",
  "PlayStation 5": "PlayStation 5",
  "PlayStation 4": "PlayStation 4",
  "Xbox Series X|S": "Xbox Series X/S",
  "Xbox One": "Xbox One",
  "PlayStation 3": "Playstation 3",
  "Xbox 360": "xbox 360",
  "Wii": "Wii",
  "Wii U": "Wii U",
  "Nintendo 3DS": "Nintendo 3DS",
  "New Nintendo 3DS": "New Nintenendo 3DS",
  "Nintendo DS": "Nintendo DS",
  "Nintendo DSi": "Nintendo DSi",
  "PlayStation Vita": "PlayStation Vita",
  "PlayStation Portable": "Playstation Portable",
  "iOS": "iOS",
  "Android": "Android",
  "Mac": "Mac",
  "Game Boy Advance": "Game Boy Advance",
  "Nintendo 64": "Nintendo 64",
  "Nintendo GameCube": "Nintendo GameCube",
  "PlayStation": "Playstation",
  "Dreamcast": "Dreamcast",
  "Game Boy Color": "Game Boy Color",
  "Game Boy": "Game Boy",
  "Super Nintendo Entertainment System": "Super Famicom",
  "Nintendo Entertainment System": "Nintendo Entertainment System",
  "WonderSwan": "WonderSwan",
  "WonderSwan Color": "WonderSwan Color",
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

function mapPlatformNames(platforms: Array<{ name?: string | null }> | null | undefined): GamePlatform[] {
  if (!platforms || platforms.length === 0) {
    return ["その他"];
  }

  const mapped = platforms
    .map((platform) => {
      const name = platform?.name;
      if (!name) return undefined;
      return PLATFORM_NAME_MAP[name] ?? "その他";
    })
    .filter((platform): platform is GamePlatform => Boolean(platform));

  if (mapped.length === 0) {
    return ["その他"];
  }

  return Array.from(new Set(mapped));
}


export async function GET(request: NextRequest) {
  try {
    // クエリパラメータから offset を取得
    const searchParams = request.nextUrl.searchParams;
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = 30;

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
      console.warn("Supabase is not configured. Falling back to popular IGDB games.", supabaseError);
    }

    const igdbQuery =
      distinctIds.length > 0
        ? `
            fields ${GAME_FIELDS.join(", ")};
            where id = (${distinctIds.join(",")}) & first_release_date != null;
            sort first_release_date desc;
            limit ${limit};
            offset ${offset};
          `
        : `
            fields ${GAME_FIELDS.join(", ")};
            where total_rating != null & total_rating_count > 20 & first_release_date != null;
            sort first_release_date desc;
            limit ${limit};
            offset ${offset};
          `;

    const response = await igdbRequest<RawGame[]>("games", igdbQuery);

    const games: Game[] = response.map((game) => ({
      id: String(game.id),
      title: game.name,
      categories: mapGenresToCategories(game.genres ?? null),
      platforms: mapPlatformNames(game.platforms ?? null),
      iconUrl: buildCoverUrl(game.cover?.image_id ?? undefined),
      summary: game.summary ?? undefined,
      releaseDate: game.first_release_date 
        ? new Date(game.first_release_date * 1000).toISOString() 
        : undefined,
    }));

    return NextResponse.json({
      games,
      hasMore: response.length === limit,
      offset: offset + response.length,
    }, {
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