"use client"
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CategoryTemplate from "@/components/templates/CategoryPage/CategoryTemplate";
import OverlayComments from "@/components/organisms/CommentSection/OverlayComments";
import PageLoader from "@/components/organisms/Loading/PageLoader";
import { usePageLoad } from "@/hooks/usePageLoad";
import { fetchOverlayCommentsAPI } from "@/lib/overlayComments";
import { Game, GameCategory, GamePlatform, ALL_GAME_CATEGORIES, ALL_GAME_PLATFORMS } from "@/types/game";
import type { OverlayComment, FloatingComment } from "@/types/overlayComment";

const FALLBACK_GAMES: Game[] = [
  { id: '1', title: 'ゼルダの伝説 ティアーズ オブ ザ キングダム', categories: ['アクション', 'RPG'], platforms: ['Nintendo Switch'] },
  { id: '2', title: 'スプラトゥーン3', categories: ['シューター'], platforms: ['Nintendo Switch'] },
  { id: '3', title: 'マリオカート8 デラックス', categories: ['スポーツ'], platforms: ['Nintendo Switch'] },
  { id: '4', title: 'ぷよぷよテトリス2', categories: ['パズル'], platforms: ['Nintendo Switch', 'PlayStation 4'] },
  { id: '5', title: 'ベヨネッタ3', categories: ['アクション'], platforms: ['Nintendo Switch'] },
];

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const isPageLoading = usePageLoad();
  
  // ゲームデータ関連
  const [games, setGames] = useState<Game[]>([]);
  const [isGamesLoading, setIsGamesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  // カテゴリフィルター
  const [selectedCategories, setSelectedCategories] = useState<GameCategory[]>([]);
  
  // プラットフォームフィルター
  const [selectedPlatforms, setSelectedPlatforms] = useState<GamePlatform[]>([]);
  
  // オーバーレイコメント
  const [hoveredGameId, setHoveredGameId] = useState<string | null>(null);
  const [floatingComments, setFloatingComments] = useState<FloatingComment[]>([]);
  const commentsCacheRef = useRef<Record<string, OverlayComment[]>>({});
  const scheduledTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  
  // 無限スクロール用
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /**
   * ゲーム一覧を取得
   */
const fetchGames = useCallback(async (currentOffset: number, signal?: AbortSignal) => {
  console.log("=== fetchGames 開始 ===");
  console.log("currentOffset:", currentOffset);
  
  setIsGamesLoading(true);
  try {
    const url = `/api/games?offset=${currentOffset}`;
    console.log("API URL:", url);
    
    const response = await fetch(url, {
      signal,
      cache: "no-store",
    });
    
    console.log("API レスポンスステータス:", response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API レスポンスデータ:", data);
    
    // data.gamesが存在するか確認
    if (!data || !Array.isArray(data.games)) {
      console.error("API レスポンスが不正です:", data);
      throw new Error("Invalid API response");
    }
    
    console.log("取得したゲーム数:", data.games.length);
    
    setGames(prev => {
      const newGames = currentOffset === 0 ? data.games : [...prev, ...data.games];
      console.log("setGames: 新しいgames配列の長さ:", newGames.length);
      return newGames;
    });
    setHasMore(data.hasMore ?? false);
    setOffset(data.offset ?? 0);
    setError(null);
  } catch (err) {
    if ((err as Error)?.name === "AbortError") {
      console.log("→ リクエストがキャンセルされました");
      return;
    }
    
    console.error("ゲーム一覧の取得に失敗しました", err);
    setError("ゲーム情報の取得に失敗しました。");
    if (currentOffset === 0) {
      console.log("→ フォールバックゲームを設定");
      setGames(FALLBACK_GAMES);
    }
  } finally {
    setIsGamesLoading(false);
    console.log("=== fetchGames 終了 ===");
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
    void fetchGames(0, controller.signal);
    
    return () => {
      controller.abort();
    };
  }, [fetchGames]);

  /**
   * 無限スクロールの設定
   */
  
  useEffect(() => {
  console.log("=== 無限スクロール useEffect 実行 ===");
  console.log("isGamesLoading:", isGamesLoading);
  console.log("hasMore:", hasMore);
  console.log("offset:", offset);
  console.log("loadMoreRef.current:", loadMoreRef.current);
  
  if (isGamesLoading || !hasMore) {
    console.log("→ スキップ（ローディング中 or これ以上なし）");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      console.log("=== IntersectionObserver コールバック ===");
      console.log("isIntersecting:", entries[0].isIntersecting);
      console.log("hasMore:", hasMore);
      console.log("isGamesLoading:", isGamesLoading);
      
      if (entries[0].isIntersecting && hasMore && !isGamesLoading) {
        console.log("→ 次のページを読み込み開始");
        void fetchGames(offset);
      }
    },
    { threshold: 0.1 }
  );

  if (loadMoreRef.current) {
    console.log("→ Observer を設定");
    observer.observe(loadMoreRef.current);
  } else {
    console.log("→ loadMoreRef.current が null");
  }

  return () => {
    console.log("→ Observer をクリーンアップ");
    observer.disconnect();
  };
}, [offset, hasMore, isGamesLoading, fetchGames]);

  /**
   * コメントの事前取得（最大24件）
   */
  useEffect(() => {
    if (!games || games.length === 0) return; 

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
   * カテゴリとプラットフォームの両方で絞り込み
   */
 const filteredGames = useMemo(() => {
  console.log("=== filteredGames 計算開始 ===");
  console.log("games.length:", games.length);
  console.log("selectedCategories:", selectedCategories);
  console.log("selectedPlatforms:", selectedPlatforms);
  
  // フィルター条件が何もない場合は全ゲーム表示
  if (selectedCategories.length === 0 && selectedPlatforms.length === 0) {
    console.log("→ フィルター条件なし、全ゲーム返却:", games.length);
    return games;
  }
  
  const result = games.filter(game => {
    // カテゴリチェック（選択されている場合のみ）
    const categoryMatch = selectedCategories.length === 0 || 
      game.categories.some(category => selectedCategories.includes(category));
    
    // プラットフォームチェック（選択されている場合のみ）
    const platformMatch = selectedPlatforms.length === 0 || 
      (game.platforms && game.platforms.some(platform => selectedPlatforms.includes(platform)));
    
    const matches = categoryMatch && platformMatch;
    
    console.log(`ゲーム: ${game.title}`);
    console.log(`  categories: ${game.categories.join(", ")}`);
    console.log(`  platforms: ${game.platforms?.join(", ") || "なし"}`);
    console.log(`  categoryMatch: ${categoryMatch}, platformMatch: ${platformMatch}, 結果: ${matches}`);
    
    return matches;
  });
  
  console.log("→ フィルター結果:", result.length, "件");
  return result;
}, [selectedCategories, selectedPlatforms, games]);

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
   * プラットフォーム選択切り替え
   */
  const handlePlatformToggle = useCallback((platform: GamePlatform) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  }, []);

  /**
   * 全解除（カテゴリ＋プラットフォーム両方）
   */
  const handleResetAll = useCallback(() => {
    setSelectedCategories([]);
    setSelectedPlatforms([]);
  }, []);

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
    setGames([]);
    setOffset(0);
    setHasMore(true);
    void fetchGames(0);
  }, [fetchGames]);

  return (
    <>
      {/* ページ全体のローディング */}
      <PageLoader isLoading={isPageLoading} />

      <CategoryTemplate
        categories={ALL_GAME_CATEGORIES}
        selectedCategories={selectedCategories}
        platforms={ALL_GAME_PLATFORMS}
        selectedPlatforms={selectedPlatforms}
        filteredGames={filteredGames}
        onCategoryToggle={handleCategoryToggle}
        onPlatformToggle={handlePlatformToggle}
        onResetAll={handleResetAll}
        onGameClick={handleGameClick}
        onGameHover={handleGameHover}
        onGameLeave={handleGameLeave}
        isLoading={isGamesLoading}
        error={error}
        onRetry={handleRetry}
        loadMoreRef={loadMoreRef}
        hasMore={hasMore}
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