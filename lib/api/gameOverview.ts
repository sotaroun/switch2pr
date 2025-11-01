import type { GameDetailResponse, GameOverviewData } from "@/types/game-detail";

const DEFAULT_SUMMARY = "概要情報は未掲載です。";

type GameOverviewResult = {
  data: GameOverviewData | null;
  error?: string;
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

export async function getGameOverview(gameId: string | null): Promise<GameOverviewResult> {
  if (!gameId) {
    return { data: null, error: "ゲームIDが見つかりません。" };
  }

  const overview = await fetchIgdbOverview(gameId);
  if (overview) {
    return { data: overview };
  }

  return { data: null, error: "IGDBからゲーム情報を取得できませんでした。" };
}
