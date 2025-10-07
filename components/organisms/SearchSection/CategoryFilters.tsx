import React, { memo } from 'react';
import CategoryFilter from '../../molecules/Navigation/CategoryFilter';

interface CategoryFilterOrgProps {
  /** 利用可能なカテゴリ一覧 */
  categories: string[];
  /** 現在選択中のカテゴリ */
  selectedCategories: string[];
  /** カテゴリ選択切り替え時のハンドラー */
  onCategoryToggle: (category: string) => void;
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
 *   categories={allCategories}
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