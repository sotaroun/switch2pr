import React, { memo } from 'react';
import FilterButton from './FilterButton';
import { GamePlatform } from "@/types/game";

interface PlatformButtonProps {
  /** プラットフォーム名（厳密な型） */
  platform: GamePlatform;
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
 * プラットフォーム選択ボタンのAtomコンポーネント
 * FilterButtonのラッパー
 */
const PlatformButton: React.FC<PlatformButtonProps> = memo((props) => {
  return (
    <FilterButton
      label={props.platform}
      isSelected={props.isSelected}
      isAnimating={props.isAnimating}
      onClick={props.onClick}
      onKeyDown={props.onKeyDown}
      animationDelay={props.animationDelay}
      ariaLabel={`${props.platform}を${props.isSelected ? '解除' : '選択'}`}
    />
  );
});

PlatformButton.displayName = 'PlatformButton';

export default PlatformButton;