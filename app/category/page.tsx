"use client"
import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CategoryTemplate from '../../components/templates/CategoryPage/CategoryTemplate';
import { Game } from '../../types/game';

/**
 * カテゴリページのメインコンポーネント
 * - 状態管理
 * - データフェッチ（将来的にAPI連携）
 * - ルーティング処理
 */
const CategoryPage: React.FC = () => {
  const router = useRouter();
  
  // 選択中のカテゴリ状態（初期値: 全カテゴリ選択）
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'アクション', 'RPG', 'シューティング', 'スポーツ', 'パズル'
  ]);

  // 利用可能なカテゴリ一覧
  const allCategories = ['アクション', 'RPG', 'シューティング', 'スポーツ', 'パズル'];
  
  // TODO: 将来的にはAPIから取得
  // ダミーゲームデータ
  const allGames: Game[] = useMemo(() => [
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
  ], []);

  /**
   * カテゴリフィルタリング処理
   * 選択されたカテゴリに該当するゲームのみ表示
   */
  const filteredGames = useMemo(() => {
    if (selectedCategories.length === 0) {
      return [];
    }
    return allGames.filter(game => 
      game.categories.some(category => selectedCategories.includes(category))
    );
  }, [selectedCategories, allGames]);

  /**
   * カテゴリ選択切り替えハンドラー
   * 選択済みなら解除、未選択なら追加
   */
  const handleCategoryToggle = useCallback((category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        // 解除
        return prev.filter(c => c !== category);
      } else {
        // 選択
        return [...prev, category];
      }
    });
  }, []);

  /**
   * カテゴリ全解除ハンドラー
   */
  const handleReset = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  /**
   * 検索からゲーム選択時のハンドラー
   * ゲーム詳細ページへ遷移
   */
  const handleSelectGame = useCallback((gameId: string) => {
    router.push(`/game/${gameId}`);
  }, [router]);

  /**
   * ゲームカードクリック時のハンドラー
   * ゲーム詳細ページへ遷移
   */
  const handleGameClick = useCallback((gameId: string) => {
    router.push(`/game/${gameId}`);
  }, [router]);

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