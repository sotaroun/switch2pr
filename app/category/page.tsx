"use client"
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CategoryTemplate from "@/components/templates/CategoryPage/CategoryTemplate";
import OverlayComments from "@/components/organisms/CommentSection/OverlayComments";
import PageLoader from "@/components/organisms/Loading/PageLoader";
import { usePageLoad } from "@/hooks/usePageLoad";
import { fetchOverlayCommentsAPI } from "@/lib/overlayComments";
import { Game, GameCategory, ALL_GAME_CATEGORIES } from "@/types/game";
import type { OverlayComment, FloatingComment } from "@/types/overlayComment";

const FALLBACK_GAMES: Game[] = [
  { id: '1', title: 'ゼルダの伝説 ティアーズ オブ ザ キングダム', categories: ['アクション', 'RPG'] },
  { id: '2', title: 'スプラトゥーン3', categories: ['シューター'] },
  { id: '3', title: 'マリオカート8 デラックス', categories: ['スポーツ'] },
  { id: '4', title: 'ぷよぷよテトリス2', categories: ['パズル'] },
  { id: '5', title: 'ベヨネッタ3', categories: ['アクション'] },
];

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const isPageLoading = usePageLoad();
  
  // ゲームデータ関連
  const [games, setGames] = useState<Game[]>(FALLBACK_GAMES);
  const [isGamesLoading, setIsGamesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // カテゴリフィルター
  const [selectedCategories, setSelectedCategories] = useState<GameCategory[]>([
    ...ALL_GAME_CATEGORIES
  ]);
  
  // オーバーレイコメント
  const [hoveredGameId, setHoveredGameId] = useState<string | null>(null);
  const [floatingComments, setFloatingComments] = useState<FloatingComment[]>([]);
  const commentsCacheRef = useRef<Record<string, OverlayComment[]>>({});
  const scheduledTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  /**
   * ゲーム一覧を取得
   */
  const fetchGames = useCallback(async (signal?: AbortSignal) => {
    setIsGamesLoading(true);
    try {
      const response = await fetch("/api/games", {
        signal,
        cache: "no-store",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.status}`);
      }
      
      const data = (await response.json()) as Game[];
      setGames(data.length > 0 ? data : FALLBACK_GAMES);
      setError(null);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        return;
      }
      
      console.error("ゲーム一覧の取得に失敗しました", err);
      setError("ゲーム情報の取得に失敗しました。");
      setGames(FALLBACK_GAMES);
    } finally {
      setIsGamesLoading(false);
    }
  }, []);

  /**
   * コメント取得（キャッシュ対応）
   */
  const fetchComments = useCallback(async (gameId: string) => {
    const cached = commentsCacheRef.current[gameId];
    if (cached) {
      return cached;
    }

    const comments = await fetchOverlayCommentsAPI(gameId);
    commentsCacheRef.current = {
      ...commentsCacheRef.current,
      [gameId]: comments,
    };
    return comments;
  }, []);

  /**
   * 初回ゲームデータ取得
   */
  useEffect(() => {
    const controller = new AbortController();
    void fetchGames(controller.signal);
    
    return () => {
      controller.abort();
    };
  }, [fetchGames]);

  /**
   * コメントの事前取得（最大24件）
   */
  useEffect(() => {
    if (games.length === 0) return;

    let cancelled = false;
    const targets = games.slice(0, 24);

    (async () => {
      for (const game of targets) {
        if (cancelled) break;
        if (commentsCacheRef.current[game.id]) continue;

        try {
          await fetchComments(game.id);
          if (cancelled) break;
        } catch (error) {
          console.warn("コメントの事前取得に失敗しました", error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [games, fetchComments]);

  /**
   * フィルター済みゲーム一覧
   */
  const filteredGames = useMemo(() => {
    if (selectedCategories.length === 0) return [];
    
    return games.filter(game =>
      game.categories.some(category => selectedCategories.includes(category))
    );
  }, [selectedCategories, games]);

  /**
   * カテゴリ選択切り替え
   */
  const handleCategoryToggle = useCallback((category: GameCategory) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);

  /**
   * カテゴリリセット
   */
  const handleReset = useCallback(() => {
    setSelectedCategories([...ALL_GAME_CATEGORIES]);
  }, []);

  /**
   * 検索結果選択
   */
  const handleSelectGame = useCallback((gameId: string) => {
    router.push(`/game/${gameId}`);
  }, [router]);

  /**
   * ゲームクリック
   */
  const handleGameClick = useCallback((gameId: string) => {
    router.push(`/game/${gameId}`);
  }, [router]);

  /**
   * スケジュール済みコメントをクリア
   */
  const clearScheduledComments = useCallback(() => {
    scheduledTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    scheduledTimeoutsRef.current = [];
    setFloatingComments([]);
  }, []);

  /**
   * コメントをスケジュール
   */
  const scheduleComments = useCallback((comments: OverlayComment[]) => {
    clearScheduledComments();
    
    if (comments.length === 0) {
      console.log("[overlay] コメントが存在しません");
      return;
    }

    const totalLanes = 20;
    const maxComments = Math.min(comments.length, 25);
    const floatingList: FloatingComment[] = [];
    const usedLanes = new Set<number>();

    for (let index = 0; index < maxComments; index++) {
      const baseComment = comments[index % comments.length];
      let lane = Math.floor(Math.random() * totalLanes);
      
      if (usedLanes.has(lane)) {
        lane = (lane + 1) % totalLanes;
      }
      usedLanes.add(lane);

      const charCount = baseComment.content.length;
      const duration = Math.max(6, Math.min(18, charCount * 0.2 + 8));
      const fontSize = 16 + Math.floor(Math.random() * 8);
      const key = `${baseComment.id}-${lane}-${index}-${Date.now()}`;
      const delay = 0;

      floatingList.push({
        id: baseComment.id,
        content: baseComment.content,
        createdAt: baseComment.createdAt,
        lane,
        duration,
        fontSize,
        key,
        delay,
      });
    }

    setFloatingComments(floatingList);

    floatingList.forEach((item) => {
      const timeout = setTimeout(() => {
        setFloatingComments((prev) => prev.filter((comment) => comment.key !== item.key));
      }, (item.delay + item.duration) * 1000);
      scheduledTimeoutsRef.current.push(timeout);
    });
  }, [clearScheduledComments]);

  /**
   * ホバー時のコメント表示
   */
  useEffect(() => {
    if (!hoveredGameId) {
      clearScheduledComments();
      return;
    }

    let cancelled = false;

    (async () => {
      const comments = await fetchComments(hoveredGameId);
      if (cancelled) return;
      scheduleComments(comments);
    })();

    return () => {
      cancelled = true;
      clearScheduledComments();
    };
  }, [hoveredGameId, fetchComments, scheduleComments, clearScheduledComments]);

  /**
   * ゲームホバー開始
   */
  const handleGameHover = useCallback((gameId: string) => {
    setHoveredGameId((prev) => (prev === gameId ? prev : gameId));
  }, []);

  /**
   * ゲームホバー終了
   */
  const handleGameLeave = useCallback(() => {
    setHoveredGameId((prev) => (prev === null ? prev : null));
  }, []);

  /**
   * 再試行処理
   */
  const handleRetry = useCallback(() => {
    setError(null);
    void fetchGames();
  }, [fetchGames]);

  return (
    <>
      {/* ページ全体のローディング */}
      <PageLoader isLoading={isPageLoading} />

      <CategoryTemplate
        games={games}
        categories={ALL_GAME_CATEGORIES}
        selectedCategories={selectedCategories}
        filteredGames={filteredGames}
        onCategoryToggle={handleCategoryToggle}
        onReset={handleReset}
        onSelectGame={handleSelectGame}
        onGameClick={handleGameClick}
        onGameHover={handleGameHover}
        onGameLeave={handleGameLeave}
        isLoading={isGamesLoading}
        error={error}
        onRetry={handleRetry}
      />

      {/* オーバーレイコメント */}
      <OverlayComments 
        comments={floatingComments} 
        totalLanes={20} 
      />
    </>
  );
};

export default CategoryPage;