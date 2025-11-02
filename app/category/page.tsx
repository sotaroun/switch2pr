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
  const [games, setGames] = useState<Game[]>(FALLBACK_GAMES);
  const [isGamesLoading, setIsGamesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // カテゴリフィルター
  const [selectedCategories, setSelectedCategories] = useState<GameCategory[]>([]);
  
  // プラットフォームフィルター
  const [selectedPlatforms, setSelectedPlatforms] = useState<GamePlatform[]>([]);
  
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

      console.log("=== 取得したゲームデータ ===");
console.log("ゲーム数:", data.length);
console.log("最初のゲーム:", data[0]);
console.log("platforms情報:", data[0]?.platforms);

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
   * カテゴリとプラットフォームの両方で絞り込み
   */
const filteredGames = useMemo(() => {
  console.log("=== フィルタリング実行 ===");
  console.log("選択中カテゴリ:", selectedCategories);
  console.log("選択中プラットフォーム:", selectedPlatforms);
  console.log("全ゲーム数:", games.length);
  
  // 両方とも未選択の場合は空配列
  if (selectedCategories.length === 0 && selectedPlatforms.length === 0) {
    console.log("→ 結果: 両方未選択のため空配列");
    return [];
  }
  
  const result = games.filter(game => {
    // カテゴリチェック
    const categoryMatch = selectedCategories.length === 0 || 
      game.categories.some(category => selectedCategories.includes(category));
    
    // プラットフォームチェック
    const platformMatch = selectedPlatforms.length === 0 || 
      (game.platforms && game.platforms.some(platform => selectedPlatforms.includes(platform)));
    
    console.log(`ゲーム: ${game.title}`);
    console.log(`  - platforms: ${game.platforms?.join(", ") || "なし"}`);
    console.log(`  - categoryMatch: ${categoryMatch}, platformMatch: ${platformMatch}`);
    
    return categoryMatch && platformMatch;
  });
  
  console.log("→ フィルタリング結果:", result.length, "件");
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
  console.log("=== プラットフォーム選択 ===");
  console.log("選択されたプラットフォーム:", platform);
  
  setSelectedPlatforms(prev => {
    const next = prev.includes(platform)
      ? prev.filter(p => p !== platform)
      : [...prev, platform];
    console.log("新しい選択状態:", next);
    return next;
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
    void fetchGames();
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