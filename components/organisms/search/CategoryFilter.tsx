import React, { memo } from 'react';
import CategoryFilter from "@/components/molecules/Navigation/CategoryFilter";
import { GameCategory } from "@/types/game";

interface CategoryFilterOrgProps {
  /** 利用可能なカテゴリ一覧（厳密な型） */
  categories: readonly GameCategory[];
  /** 現在選択中のカテゴリ（厳密な型） */
  selectedCategories: GameCategory[];
  /** カテゴリ選択切り替え時のハンドラー */
  onCategoryToggle: (category: GameCategory) => void;
  /** 全解除時のハンドラー */
  onReset: () => void;
}

/**
 * カテゴリフィルターのOrganismラッパーコンポーネント
 * Moleculeコンポーネントをそのまま使用
 * 将来的に追加機能が必要な場合はここに実装
 * 
 * @example
 * ```tsx
 * <CategoryFilterOrg
 *   categories={ALL_GAME_CATEGORIES}
 *   selectedCategories={selected}
 *   onCategoryToggle={handleToggle}
 *   onReset={handleReset}
 * />
 * ```
 */
const CategoryFilterOrg: React.FC<CategoryFilterOrgProps> = memo((props) => {
  return <CategoryFilter {...props} />;
});

CategoryFilterOrg.displayName = 'CategoryFilterOrg';

export default CategoryFilterOrg;
