import { useEffect, useState } from "react";

import { getGameOverview } from "@/lib/api/gameOverview";
import { readGameOverviewCache } from "@/lib/cache/gameOverviewCache";
import type { GameOverviewData } from "@/types/game-detail";

type UseGameOverviewResult = {
  data: GameOverviewData | null;
  loading: boolean;
  error: string | null;
};

export function useGameOverview(gameId: string | null): UseGameOverviewResult {
  const [data, setData] = useState<GameOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setData(null);
      setError("ゲームIDが見つかりません。");
      setLoading(false);
      return;
    }

    const snapshot = readGameOverviewCache(gameId);
    if (snapshot) {
      setData(snapshot.data);
      setError(snapshot.error ?? null);
      if (!snapshot.isStale) {
        setLoading(false);
        return;
      }
    } else {
      setData(null);
      setError(null);
    }

    let cancelled = false;

    const load = async () => {
      try {
        const result = await getGameOverview(gameId, { force: true });
        if (cancelled) return;
        setData(result.data);
        setError(result.error ?? null);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load game overview", err);
        setData(null);
        setError("ゲーム情報の取得に失敗しました。");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    void load();

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  return { data, loading, error };
}
