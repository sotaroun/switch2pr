import React, { memo } from 'react';
import { Button, Text } from "@chakra-ui/react";

interface CategoryButtonProps {
  /** カテゴリ名 */
  category: string;
  /** 選択状態 */
  isSelected: boolean;
  /** アニメーション中かどうか */
  isAnimating: boolean;
  /** クリック時のハンドラー */
  onClick: () => void;
  /** キーボード操作時のハンドラー */
  onKeyDown: (e: React.KeyboardEvent) => void;
  /** アニメーション遅延時間 */
  animationDelay?: string;
}

/**
 * カテゴリ選択ボタンのAtomコンポーネント
 * - 選択状態に応じたスタイル変更
 * - ホバー・フォーカスエフェクト
 * - アニメーション対応
 * 
 * @example
 * ```tsx
 * <CategoryButton
 *   category="アクション"
 *   isSelected={true}
 *   isAnimating={false}
 *   onClick={handleClick}
 *   onKeyDown={handleKeyDown}
 * />
 * ```
 */
const CategoryButton: React.FC<CategoryButtonProps> = memo(({
  category,
  isSelected,
  isAnimating,
  onClick,
  onKeyDown,
  animationDelay = "0ms"
}) => {
  return (
    <Button
      onClick={onClick}
      onKeyDown={onKeyDown}
      size="md"
      variant={isSelected ? "solid" : "outline"}
      colorScheme={isSelected ? "blue" : "gray"}
      bg={isSelected ? "blue.500" : "gray.700"}
      color={isSelected ? "white" : "gray.300"}
      borderColor={isSelected ? "blue.500" : "gray.600"}
      _hover={{
        bg: isSelected ? "blue.600" : "gray.600",
        color: "white",
        transform: "scale(1.05)",
      }}
      _focus={{
        ring: 2,
        ringColor: "blue.400",
        ringOffset: 2,
        ringOffsetColor: "gray.900",
        outline: "none"
      }}
      transform={isAnimating ? (isSelected ? "scale(1.05)" : "scale(0.95)") : "scale(1)"}
      transition="all 0.3s ease"
      style={{
        animationDelay: animationDelay
      }}
      aria-pressed={isSelected}
      aria-label={`${category}カテゴリを${isSelected ? '解除' : '選択'}`}
    >
      <Text fontSize="sm" fontWeight="medium">
        {category}
      </Text>
    </Button>
  );
});

CategoryButton.displayName = 'CategoryButton';

export default CategoryButton;