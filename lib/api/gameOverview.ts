import { isLikelyJapanese } from "@/lib/translation/text-utils";
import type { GameDetailResponse, GameOverviewData } from "@/types/game-detail";

const DEFAULT_SUMMARY = "概要情報は未掲載です。";
const TRANSLATION_ENDPOINT = "/api/deepl/translate";

type TranslationResponse = {
  translations?: string[];
};

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

async function translateIfNeeded(overview: GameOverviewData): Promise<GameOverviewData> {
  const texts: string[] = [];
  const map: Array<"name" | "summary"> = [];

  if (!isLikelyJapanese(overview.name)) {
    texts.push(overview.name);
    map.push("name");
  }

  if (!isLikelyJapanese(overview.summary)) {
    texts.push(overview.summary);
    map.push("summary");
  }

  if (texts.length === 0) {
    return overview;
  }

  try {
    const response = await fetch(TRANSLATION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, targetLang: "JA" }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to translate overview", await response.text());
      return overview;
    }

    const json = (await response.json()) as TranslationResponse;
    const translated = { ...overview };

    map.forEach((field, index) => {
      const text = json.translations?.[index];
      if (text) {
        translated[field] = text;
      }
    });

    return translated;
  } catch (error) {
    console.error("Unexpected error while translating overview", error);
    return overview;
  }
}

async function fetchIgdbOverview(gameId: string): Promise<GameOverviewData | null> {
  try {
    const response = await fetch(`/api/igdb/${gameId}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const json = (await response.json()) as GameDetailResponse;
    const overview = normalizeOverview(json);
    if (!overview) return null;
    return translateIfNeeded(overview);
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
