import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Stack,
  Text, 
  Heading, 
  Wrap, 
  WrapItem,
  Badge,
  Flex
} from "@chakra-ui/react";
import { MdClear } from "react-icons/md";
import CategoryButton from '../../../atoms/Button/CategoryButton';
import ActionButton from '../../../atoms/Button/ActionButton';

interface CategoryFilterProps {
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
 * カテゴリフィルター機能を提供するMoleculeコンポーネント
 * - 複数選択可能なカテゴリボタン群
 * - 選択状態の表示
 * - 全解除ボタン
 * - アニメーション効果
 * 
 * @example
 * ```tsx
 * <CategoryFilter
 *   categories={['アクション', 'RPG', 'パズル']}
 *   selectedCategories={['アクション']}
 *   onCategoryToggle={(category) => handleToggle(category)}
 *   onReset={handleReset}
 * />
 * ```
 */
const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle,
  onReset
}) => {
  const [animatingButtons, setAnimatingButtons] = useState<Set<string>>(new Set());

  /**
   * カテゴリボタンクリック時の処理
   * アニメーションを開始し、300ms後に終了
   */
  const handleCategoryClick = useCallback((category: string) => {
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
   * リセットボタンクリック時の処理
   */
  const handleReset = useCallback(() => {
    onReset();
  }, [onReset]);

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
        <Stack direction="column" gap={2}>
          <Heading 
            id="category-filter-title"
            as="h2" 
            size="xl" 
            color="white"
          >
            カテゴリで絞り込み
          </Heading>
          <Text color="gray.400" fontSize="sm">
            カテゴリを選択してゲームを絞り込めます
          </Text>
        </Stack>

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
        mb={6}
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

      {/* 全解除ボタン */}
      <Flex justify="center">
        <ActionButton
          onClick={handleReset}
          onKeyDown={(e) => handleKeyDown(e, handleReset)}
          colorScheme="red"
          icon={MdClear}
          ariaLabel="すべてのカテゴリを解除"
        >
          全解除
        </ActionButton>
      </Flex>
    </Box>
  );
};

export default CategoryFilter;