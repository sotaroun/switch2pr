import type { GameDetailResponse, GameOverviewData } from "@/types/game-detail";
import {
  readGameOverviewCache,
  writeGameOverviewCache,
} from "@/lib/cache/gameOverviewCache";

const DEFAULT_SUMMARY = "概要情報は未掲載です。";

type GameOverviewResult = {
  data: GameOverviewData | null;
  error?: string;
};

type GetGameOverviewOptions = {
  force?: boolean;
};

function normalizeOverview(data: GameDetailResponse | null): GameOverviewData | null {
  if (!data) return null;
  return {
    name: data.name,
    summary: data.summary ?? DEFAULT_SUMMARY,
    genres: data.genres ?? [],
  };
}

async function fetchIgdbOverview(gameId: string): Promise<GameOverviewData | null> {
  try {
    const response = await fetch(`/api/igdb/${gameId}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const json = (await response.json()) as GameDetailResponse;
    return normalizeOverview(json);
  } catch (error) {
    console.error("Failed to fetch IGDB overview", error);
    return null;
  }
}

export async function getGameOverview(
  gameId: string | null,
  options?: GetGameOverviewOptions
): Promise<GameOverviewResult> {
  if (!gameId) {
    return { data: null, error: "ゲームIDが見つかりません。" };
  }

  const cached = readGameOverviewCache(gameId);
  if (!options?.force && cached && !cached.isStale) {
    return {
      data: cached.data,
      error: cached.error ?? undefined,
    };
  }

  const overview = await fetchIgdbOverview(gameId);
  if (overview) {
    writeGameOverviewCache(gameId, overview, null);
    return { data: overview };
  }

  const errorMessage = "IGDBからゲーム情報を取得できませんでした。";
  writeGameOverviewCache(gameId, null, errorMessage);
  return { data: null, error: errorMessage };
}

export async function prefetchGameOverview(gameId: string | null) {
  if (!gameId) {
    return;
  }
  const cached = readGameOverviewCache(gameId);
  if (cached && !cached.isStale) {
    return;
  }
  try {
    await getGameOverview(gameId, { force: true });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Failed to prefetch game overview", error);
    }
  }
}
