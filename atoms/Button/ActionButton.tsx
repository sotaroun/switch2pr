import React, { memo } from 'react';
import { Button, Icon } from "@chakra-ui/react";
import { IconType } from "react-icons";

interface ActionButtonProps {
  /** ボタンのラベル */
  children: React.ReactNode;
  /** クリック時のハンドラー */
  onClick: () => void;
  /** キーボード操作時のハンドラー */
  onKeyDown: (e: React.KeyboardEvent) => void;
  /** カラースキーム */
  colorScheme: string;
  /** アイコン（オプション） */
  icon?: IconType;
  /** ボタンサイズ */
  size?: "sm" | "md" | "lg";
  /** aria-label */
  ariaLabel?: string;
}

/**
 * 汎用アクションボタンのAtomコンポーネント
 * リセットや削除などの重要なアクションに使用
 * 
 * @example
 * ```tsx
 * <ActionButton
 *   onClick={handleReset}
 *   onKeyDown={handleKeyDown}
 *   colorScheme="red"
 *   icon={MdClear}
 *   ariaLabel="全カテゴリをリセット"
 * >
 *   全解除
 * </ActionButton>
 * ```
 */
const ActionButton: React.FC<ActionButtonProps> = memo(({
  children,
  onClick,
  onKeyDown,
  colorScheme,
  icon,
  size = "lg",
  ariaLabel
}) => {
  return (
    <Button
      onClick={onClick}
      onKeyDown={onKeyDown}
      colorScheme={colorScheme}
      variant="solid"
      bg={`${colorScheme}.600`}
      _hover={{ 
        bg: `${colorScheme}.700`,
        transform: "scale(1.05)"
      }}
      _focus={{
        ring: 2,
        ringColor: `${colorScheme}.400`,
        ringOffset: 2,
        ringOffsetColor: "gray.900",
        outline: "none"
      }}
      size={size}
      transition="all 0.2s ease"
      aria-label={ariaLabel}
    >
      {icon && <Icon as={icon} mr={2} />}
      {children}
    </Button>
  );
});

ActionButton.displayName = 'ActionButton';

export default ActionButton;