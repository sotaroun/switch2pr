"use client"
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CategoryTemplate from "@/components/templates/CategoryPage/CategoryTemplate";
import OverlayComments from "@/components/organisms/CommentSection/OverlayComments";
import PageLoader from "@/components/organisms/Loading/PageLoader";
import { useOverlayComments } from "@/hooks/comments/useOverlayComments";
import { usePageLoad } from "@/hooks/usePageLoad";
import { fetchOverlayCommentsAPI } from "@/lib/overlayComments";
import { Game, GameCategory, ALL_GAME_CATEGORIES } from "@/types/game";

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const isPageLoading = usePageLoad();
  const [selectedCategories, setSelectedCategories] = useState<GameCategory[]>([
    ...ALL_GAME_CATEGORIES,
  ]);
  const [hoveredGameId, setHoveredGameId] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const prefetchedRoutesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const controller = new AbortController();
    setGamesLoading(true);
    void (async () => {
      try {
        const response = await fetch("/api/games", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`failed: ${response.status}`);
        }
        const json = (await response.json()) as Game[];
        const categorized = json.filter((game) => game.visibleOnCategory !== false);
        if (categorized.length > 0) {
          setGames(categorized);
        } else {
          setGames(json.slice(0, 8));
        }
      } catch (error) {
        console.error("Failed to fetch games for category", error);
        setGames([]);
      } finally {
        setGamesLoading(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, []);

  // オーバーレイコメント機能
  const fetchComments = useCallback((gameId: string) => {
    return fetchOverlayCommentsAPI(gameId);
  }, []);

  const { comments, isLoading, startHover, endHover } = useOverlayComments({
    gameId: hoveredGameId,
    fetchComments,
    maxDisplay: 20,
    totalLanes: 20,
  });

  const filteredGames = useMemo(() => {
    if (selectedCategories.length === 0) return [];
    return games.filter((game) =>
      game.categories.some(category => selectedCategories.includes(category))
    );
  }, [selectedCategories, games]);

  const handleCategoryToggle = useCallback((category: GameCategory) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);

  const handleReset = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const handleSelectGame = useCallback((gameId: string) => {
    router.push(`/game/${gameId}`);
  }, [router]);

  const handleGameClick = useCallback((gameId: string) => {
    router.push(`/game/${gameId}`);
  }, [router]);

  const handleGameHover = useCallback((gameId: string) => {
    setHoveredGameId(gameId);
    startHover();
    const route = `/game/${gameId}`;
    if (!prefetchedRoutesRef.current.has(route)) {
      prefetchedRoutesRef.current.add(route);
      try {
        router.prefetch(route);
      } catch (error) {
        console.warn("Failed to prefetch route", route, error);
        prefetchedRoutesRef.current.delete(route);
      }
    }
  }, [router, startHover]);

  const handleGameLeave = useCallback(() => {
    setHoveredGameId(null);
    endHover();
  }, [endHover]);

  return (
    <>
      <PageLoader isLoading={isPageLoading || gamesLoading} />
      
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
      />
      
      {/* オーバーレイコメント */}
      <OverlayComments comments={comments} isLoading={isLoading} totalLanes={20} />
    </>
  );
};

export default CategoryPage;
