import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Stack,
  Text, 
  Wrap, 
  WrapItem,
  Badge
} from "@chakra-ui/react";
import CategoryButton from "@/components/atoms/buttons/CategoryButton";
import { GameCategory } from "@/types/game";

interface CategoryFilterProps {
  /** 利用可能なカテゴリ一覧（厳密な型） */
  categories: readonly GameCategory[];
  /** 現在選択中のカテゴリ（厳密な型） */
  selectedCategories: GameCategory[];
  /** カテゴリ選択切り替え時のハンドラー */
  onCategoryToggle: (category: GameCategory) => void;
}

/**
 * カテゴリフィルター機能を提供するMoleculeコンポーネント
 * - 複数選択可能なカテゴリボタン群
 * - 選択状態の表示
 * - アニメーション効果
 */
const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle
}) => {
  const [animatingButtons, setAnimatingButtons] = useState<Set<GameCategory>>(new Set());

  /**
   * カテゴリボタンクリック時の処理
   * アニメーションを開始し、300ms後に終了
   */
  const handleCategoryClick = useCallback((category: GameCategory) => {
    // アニメーション開始
    setAnimatingButtons(prev => new Set([...prev, category]));
    
    // 即座にフィルター実行
    onCategoryToggle(category);
    
    // アニメーション終了
    setTimeout(() => {
      setAnimatingButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(category);
        return newSet;
      });
    }, 300);
  }, [onCategoryToggle]);

  /**
   * キーボード操作（Enter/Space）の処理
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  }, []);

  return (
    <Box as="section" mb={8} aria-labelledby="category-filter-title">
      {/* フィルター説明 */}
      <Stack direction="column" gap={6} textAlign="center" mb={6}>
        {/* 現在の選択表示 */}
        <Stack direction="column" gap={3}>
          <Text color="blue.400" fontWeight="medium" role="status" aria-live="polite">
            選択中: {selectedCategories.length}個のカテゴリ
          </Text>
          {selectedCategories.length > 0 && (
            <Wrap justify="center" gap={2}>
              {selectedCategories.map((category) => (
                <WrapItem key={category}>
                  <Badge 
                    colorScheme="blue" 
                    variant="subtle" 
                    fontSize="xs"
                    px={2} 
                    py={1}
                  >
                    {category}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>
          )}
        </Stack>
      </Stack>

      {/* カテゴリボタン群 */}
      <Wrap 
        justify="center" 
        gap={3}
        role="group"
        aria-label="カテゴリ選択ボタン"
      >
        {categories.map((category, index) => {
          const isSelected = selectedCategories.includes(category);
          const isAnimating = animatingButtons.has(category);
          
          return (
            <WrapItem key={category}>
              <CategoryButton
                category={category}
                isSelected={isSelected}
                isAnimating={isAnimating}
                onClick={() => handleCategoryClick(category)}
                onKeyDown={(e) => handleKeyDown(e, () => handleCategoryClick(category))}
                animationDelay={`${index * 50}ms`}
              />
            </WrapItem>
          );
        })}
      </Wrap>
    </Box>
  );
};

export default CategoryFilter;