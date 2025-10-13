import { GameCategory } from './game';

/**
 * カテゴリ選択状態を管理する型
 * string[]からGameCategory[]に変更
 */
export type CategoryState = GameCategory[];

/**
 * カテゴリフィルターのハンドラー型
 */
export interface CategoryHandlers {
  /** カテゴリの選択/解除を切り替える */
  onToggle: (category: GameCategory) => void;
  /** 全カテゴリをリセット */
  onReset: () => void;
}
