import { useEffect, useState } from "react";

import { getGameOverview } from "@/lib/api/gameOverview";
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
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const result = await getGameOverview(gameId);
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

    void load();

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  return { data, loading, error };
}
