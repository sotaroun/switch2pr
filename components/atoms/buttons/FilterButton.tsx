
import React, { memo } from 'react';
import { Button, Text } from "@chakra-ui/react";

interface FilterButtonProps {
  /** ラベル（カテゴリ名またはプラットフォーム名） */
  label: string;
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
  /** アクセシビリティ用のラベル */
  ariaLabel?: string;
}

/**
 * 汎用フィルターボタンのAtomコンポーネント
 * カテゴリ・プラットフォーム両方で使用可能
 */
const FilterButton: React.FC<FilterButtonProps> = memo(({
  label,
  isSelected,
  isAnimating,
  onClick,
  onKeyDown,
  animationDelay = "0ms",
  ariaLabel
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
      aria-label={ariaLabel || `${label}を${isSelected ? '解除' : '選択'}`}
    >
      <Text fontSize="sm" fontWeight="medium">
        {label}
      </Text>
    </Button>
  );
});

FilterButton.displayName = 'FilterButton';

export default FilterButton;