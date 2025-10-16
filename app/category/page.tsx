"use client"
import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CategoryTemplate from '../../components/templates/CategoryPage/CategoryTemplate';
import OverlayComments from '../../components/organisms/CommentSection/OverlayComments';
import PageLoader from '../../components/organisms/Loading/PageLoader';
import { useOverlayComments } from '../../hooks/useOverlayComments';
import { usePageLoad } from '../../hooks/usePageLoad';
import { fetchOverlayCommentsAPI } from '../../lib/overlayComments';
import { Game, GameCategory, ALL_GAME_CATEGORIES } from '../../types/game';

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const isPageLoading = usePageLoad(); // ページ読み込み状態
  const [selectedCategories, setSelectedCategories] = useState<GameCategory[]>([
    ...ALL_GAME_CATEGORIES
  ]);
  const [hoveredGameId, setHoveredGameId] = useState<string | null>(null);

  // オーバーレイコメント機能
const fetchComments = useCallback((gameId: string) => {
  return fetchOverlayCommentsAPI(gameId);
}, []);

const { comments, isLoading, startHover, endHover } = useOverlayComments({
  gameId: hoveredGameId,
  fetchComments, 
  maxDisplay: 20,
  totalLanes: 20
});

  const allGames: Game[] = useMemo(() => [
    { id: '1', title: 'ゼルダの伝説 ティアーズ オブ ザ キングダム', categories: ['アクション', 'RPG'] },
    { id: '2', title: 'スプラトゥーン3', categories: ['シューティング'] },
    { id: '3', title: 'マリオカート8 デラックス', categories: ['スポーツ'] },
    { id: '4', title: 'ぷよぷよテトリス2', categories: ['パズル'] },
    { id: '5', title: 'ベヨネッタ3', categories: ['アクション'] },
  ], []);

  const filteredGames = useMemo(() => {
    if (selectedCategories.length === 0) return [];
    return allGames.filter(game => 
      game.categories.some(category => selectedCategories.includes(category))
    );
  }, [selectedCategories, allGames]);

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
  }, [startHover]);

  const handleGameLeave = useCallback(() => {
    setHoveredGameId(null);
    endHover();
  }, [endHover]);

  return (
    <>
      {/* ページ全体のローディング */}
      <PageLoader isLoading={isPageLoading} />
      
      <CategoryTemplate
        games={allGames}
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