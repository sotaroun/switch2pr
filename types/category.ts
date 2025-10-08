/**
 * カテゴリフィルター関連の型定義
 */

/**
 * カテゴリ選択状態を管理する型
 */
export type CategoryState = string[];

/**
 * カテゴリフィルターのハンドラー型
 */
export interface CategoryHandlers {
  /** カテゴリの選択/解除を切り替える */
  onToggle: (category: string) => void;
  /** 全カテゴリをリセット */
  onReset: () => void;
}
