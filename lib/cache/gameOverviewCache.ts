import type { GameOverviewData } from "@/types/game-detail";

type CacheEntry = {
  data: GameOverviewData | null;
  error: string | null;
  timestamp: number;
};

type CacheSnapshot = {
  data: GameOverviewData | null;
  error: string | null;
  isStale: boolean;
};

const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes
const EXPIRATION_MS = CACHE_TTL_MS * 2;

const gameOverviewCache = new Map<string, CacheEntry>();

function pruneIfExpired(id: string, entry: CacheEntry | undefined): CacheEntry | undefined {
  if (!entry) return undefined;
  const age = Date.now() - entry.timestamp;
  if (age > EXPIRATION_MS) {
    gameOverviewCache.delete(id);
    return undefined;
  }
  return entry;
}

export function readGameOverviewCache(gameId: string): CacheSnapshot | null {
  const entry = pruneIfExpired(gameId, gameOverviewCache.get(gameId));
  if (!entry) {
    return null;
  }
  const age = Date.now() - entry.timestamp;
  return {
    data: entry.data,
    error: entry.error,
    isStale: age > CACHE_TTL_MS,
  };
}

export function writeGameOverviewCache(
  gameId: string,
  data: GameOverviewData | null,
  error: string | null
) {
  gameOverviewCache.set(gameId, {
    data,
    error,
    timestamp: Date.now(),
  });
}

export function clearGameOverviewCache(gameId?: string) {
  if (typeof gameId === "string") {
    gameOverviewCache.delete(gameId);
    return;
  }
  gameOverviewCache.clear();
}
