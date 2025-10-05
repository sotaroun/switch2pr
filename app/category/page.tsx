"use client"
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CategoryTemplate from '../../components/templates/CategoryPage/CategoryTemplate';

interface Game {
  id: string;
  title: string;
  categories: string[];
  iconUrl?: string;
}

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'アクション', 'RPG', 'シューティング', 'スポーツ', 'パズル'
  ]);

  const allCategories = ['アクション', 'RPG', 'シューティング', 'スポーツ', 'パズル'];
  
  // ダミーゲームデータ（将来的にはAPIから取得）
  const allGames: Game[] = [
    { id: '1', title: 'ゼルダの伝説 ティアーズ オブ ザ キングダム', categories: ['アクション', 'RPG'] },
    { id: '2', title: 'スプラトゥーン3', categories: ['シューティング'] },
    { id: '3', title: 'マリオカート8 デラックス', categories: ['スポーツ'] },
    { id: '4', title: 'ぷよぷよテトリス2', categories: ['パズル'] },
    { id: '5', title: 'ベヨネッタ3', categories: ['アクション'] },
    { id: '6', title: 'ポケットモンスター スカーレット', categories: ['RPG'] },
    { id: '7', title: 'スーパーマリオブラザーズ ワンダー', categories: ['アクション'] },
    { id: '8', title: 'ピクミン4', categories: ['アクション', 'パズル'] },
    { id: '9', title: 'ファイアーエムブレム エンゲージ', categories: ['RPG'] },
    { id: '10', title: 'カービィのグルメフェス', categories: ['アクション'] },
  ];

  // カテゴリフィルタリング処理
  const filteredGames = useMemo(() => {
    if (selectedCategories.length === 0) {
      return [];
    }
    return allGames.filter(game => 
      game.categories.some(category => selectedCategories.includes(category))
    );
  }, [selectedCategories, allGames]);

  // カテゴリ選択切り替え
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // カテゴリ全解除
  const handleReset = () => {
    setSelectedCategories([]);
  };

  // 検索からゲーム選択
  const handleSelectGame = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };

  // ゲームカードクリック
  const handleGameClick = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };

  return (
    <CategoryTemplate
      games={allGames}
      categories={allCategories}
      selectedCategories={selectedCategories}
      filteredGames={filteredGames}
      onCategoryToggle={handleCategoryToggle}
      onReset={handleReset}
      onSelectGame={handleSelectGame}
      onGameClick={handleGameClick}
    />
  );
};

export default CategoryPage;