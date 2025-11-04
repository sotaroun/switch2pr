"use server";

import { NextRequest, NextResponse } from "next/server";

import { buildCoverUrl, igdbRequest } from "@/lib/api/igdb";
import { mapGenres, mapPlatforms } from "@/lib/gameMetadata";
import type { Game } from "@/types/game";

// IGDB から取得するフィールドを共通化しておく。
const GAME_FIELDS = [
  "id",
  "name",
  "summary",
  "cover.image_id",
  "genres.name",
  "platforms.abbreviation",
  "platforms.name",
  "total_rating",
  "total_rating_count",
  "first_release_date",
  "release_dates.date",
  "release_dates.region",
];

// 新作・人気の検索条件をまとめて管理。
const NEW_RELEASE_LIMIT = 30;
const POPULAR_LIMIT = 30;
const DLC_LIMIT = 30;
const MANUFACTURER_LIMIT = 30;
const POPULAR_MIN_RATING = 60;
const POPULAR_MIN_RATING_COUNT = 10;
const NEW_RELEASE_YEAR_THRESHOLD = 2025;
const POPULAR_YEAR_THRESHOLD = 2019;
const DLC_CATEGORIES = [1, 4];

type RawGame = {
  id: number;
  name: string;
  summary?: string | null;
  cover?: { image_id?: string | null } | null;
  genres?: Array<{ name?: string | null }> | null;
  platforms?: Array<{
    abbreviation?: string | null;
    name?: string | null;
  }> | null;
  total_rating?: number | null;
  total_rating_count?: number | null;
  first_release_date?: number | null;
  release_dates?: Array<{
    date?: number | null;
    region?: number | null;
  }> | null;
};

// IGDB からのレスポンスで重複 ID が混ざる場合があるのでユニーク化する。
function uniqueById(games: RawGame[]): RawGame[] {
  const seen = new Set<number>();
  return games.filter((game) => {
    if (!game || typeof game.id !== "number") return false;
    if (seen.has(game.id)) return false;
    seen.add(game.id);
    return true;
  });
}

// API で利用する Game 型に整形。個別フラグは overrides で付与する。
function mapGame(raw: RawGame, overrides?: Partial<Game>): Game {
  return {
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
    firstReleaseDate: raw.first_release_date ?? null,
    featuredNewRelease: false,
    featuredPopular: false,
    featuredRecommended: false,
    ...overrides,
  };
}

function buildNewReleaseQuery(now: number, offset: number) {
  const earliest = Math.floor(
    new Date(`${NEW_RELEASE_YEAR_THRESHOLD}-01-01T00:00:00Z`).getTime() / 1000
  );

  return `
    fields ${GAME_FIELDS.join(", ")};
    where first_release_date != null
      & first_release_date <= ${now}
      & first_release_date >= ${earliest};
    sort first_release_date desc;
    limit ${NEW_RELEASE_LIMIT};
    offset ${offset};
  `;
}

// 人気用の IGDB クエリを組み立てる。
function buildPopularQuery(now: number, offset: number) {
  const earliest = Math.floor(
    new Date(`${POPULAR_YEAR_THRESHOLD}-01-01T00:00:00Z`).getTime() / 1000
  );
  return `
    fields ${GAME_FIELDS.join(", ")};
    where release_dates.date != null
      & release_dates.date <= ${now}
      & release_dates.date >= ${earliest}
      & total_rating != null
      & total_rating >= ${POPULAR_MIN_RATING}
      & total_rating_count != null
      & total_rating_count >= ${POPULAR_MIN_RATING_COUNT};
    sort total_rating desc;
    limit ${POPULAR_LIMIT};
    offset ${offset};
  `;
}

function buildManufacturerQuery(now: number, offset: number, companies: string[]) {
  const earliest = Math.floor(
    new Date(`${NEW_RELEASE_YEAR_THRESHOLD}-01-01T00:00:00Z`).getTime() / 1000
  );
  const companyFilter = companies
    .map((name) => `involved_companies.company.name = "${name.replace(/"/g, '\\"')}"`)
    .join(" | ");

  return `
    fields ${GAME_FIELDS.join(", ")};
    where first_release_date != null
      & first_release_date <= ${now}
      & first_release_date >= ${earliest}
      & (${companyFilter});
    sort first_release_date desc;
    limit ${MANUFACTURER_LIMIT};
    offset ${offset};
  `;
}

function buildDlcQuery(now: number, offset: number) {
  const earliest = Math.floor(
    new Date(`${NEW_RELEASE_YEAR_THRESHOLD}-01-01T00:00:00Z`).getTime() / 1000
  );
  const categoryFilter = DLC_CATEGORIES.join(",");

  return `
    fields ${GAME_FIELDS.join(", ")};
    where first_release_date != null
      & first_release_date <= ${now}
      & first_release_date >= ${earliest}
      & category = (${categoryFilter});
    sort first_release_date desc;
    limit ${DLC_LIMIT};
    offset ${offset};
  `;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const rawOffset = Number.parseInt(searchParams.get("offset") ?? "0", 10);
  const offset = Number.isFinite(rawOffset) && rawOffset > 0 ? rawOffset : 0;
  const manufacturerCompanies = searchParams.getAll("company");

  const now = Math.floor(Date.now() / 1000);

  try {
    // `company` クエリが指定されている場合はメーカー別の新着ゲームを返す。
    if (manufacturerCompanies.length > 0) {
      const query = buildManufacturerQuery(now, offset, manufacturerCompanies);
      const response = await igdbRequest<RawGame[]>("games", query);
      const items = uniqueById(response).map((raw) => mapGame(raw));

      return NextResponse.json({
        items,
        hasMore: response.length === MANUFACTURER_LIMIT,
      });
    }

    // category が指定されている場合は無限スクロール用の追加データを返す。
    if (category === "new" || category === "popular" || category === "dlc") {
      const isNew = category === "new";
      const limit = category === "dlc" ? DLC_LIMIT : isNew ? NEW_RELEASE_LIMIT : POPULAR_LIMIT;
      const query = category === "dlc"
        ? buildDlcQuery(now, offset)
        : isNew
          ? buildNewReleaseQuery(now, offset)
          : buildPopularQuery(now, offset);

      const response = await igdbRequest<RawGame[]>("games", query);
      const items = isNew
        ? uniqueById(response).map((raw) =>
            mapGame(raw, { featuredNewRelease: true })
          )
        : category === "dlc"
        ? uniqueById(response).map((raw) => mapGame(raw))
        : uniqueById(response).map((raw) =>
            mapGame(raw, { featuredPopular: true })
          );

      return NextResponse.json({
        items,
        hasMore: response.length === limit,
      });
    }

    // 初期ロード時は新作・人気をまとめて取得。
    const [newReleaseResponse, popularResponse] = await Promise.all([
      igdbRequest<RawGame[]>("games", buildNewReleaseQuery(now, 0)),
      igdbRequest<RawGame[]>("games", buildPopularQuery(now, 0)),
    ]);

    const newReleases = uniqueById(newReleaseResponse).map((raw) =>
      mapGame(raw, { featuredNewRelease: true })
    );
    const popular = uniqueById(popularResponse).map((raw) =>
      mapGame(raw, { featuredPopular: true })
    );

    return NextResponse.json({
      newReleases,
      popular,
      newHasMore: newReleaseResponse.length === NEW_RELEASE_LIMIT,
      popularHasMore: popularResponse.length === POPULAR_LIMIT,
    });
  } catch (error) {
    console.error("Failed to fetch highlight games", error);
    return NextResponse.json(
      { error: "failed_to_fetch_highlights" },
      { status: 500 }
    );
  }
}
