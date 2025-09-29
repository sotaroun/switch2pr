"use client"
import React, { useState, useMemo } from 'react';
import CategoryTemplate from '../../components/templates/CategoryPage/CategoryTemplate';

interface Game {
  id: string;
  title: string;
  categories: string[];
  iconUrl: string;
}

const CategoryPage: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'アクション', 'RPG', 'シューティング', 'スポーツ', 'パズル'
  ]);

  const allCategories = ['アクション', 'RPG', 'シューティング', 'スポーツ', 'パズル'];
  
  // ダミーゲームデータ
  const allGames: Game[] = [
    { id: '1', title: 'ゼルダの伝説', categories: ['アクション', 'RPG'], iconUrl: '/games/zelda.jpg' },
    { id: '2', title: 'スプラトゥーン3', categories: ['シューティング'], iconUrl: '/games/splatoon.jpg' },
    { id: '3', title: 'マリオカート8', categories: ['スポーツ'], iconUrl: '/games/mariokart.jpg' },
    { id: '4', title: 'ぷよぷよテトリス', categories: ['パズル'], iconUrl: '/games/puyo.jpg' },
    { id: '5', title: 'ベヨネッタ3', categories: ['アクション'], iconUrl: '/games/bayonetta.jpg' },
  ];

  // 絞り込み処理（即時反映）
  const filteredGames = useMemo(() => {
    if (selectedCategories.length === 0) {
      return [];
    }
    return allGames.filter(game => 
      game.categories.some(category => selectedCategories.includes(category))
    );
  }, [selectedCategories]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        // 解除
        return prev.filter(c => c !== category);
      } else {
        // 選択
        return [...prev, category];
      }
    });
  };

  const handleReset = () => {
    // 全解除で一覧が元通り
    setSelectedCategories([]);
  };

  return (
    <CategoryTemplate
      categories={allCategories}
      selectedCategories={selectedCategories}
      filteredGames={filteredGames}
      onCategoryToggle={handleCategoryToggle}
      onReset={handleReset}
    />
  );
};

export default CategoryPage;