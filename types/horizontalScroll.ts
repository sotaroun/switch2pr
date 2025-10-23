/**
 * 横スクロールリスト関連の型定義
 */

/**
 * 横スクロールリストの状態
 */
export type HorizontalScrollState = 'loading' | 'success' | 'error' | 'empty';

/**
 * 横スクロールリストのプロパティ
 */
export interface HorizontalScrollConfig {
  /** デスクトップ時の表示カード数 */
  desktopCards: number;
  /** タブレット時の表示カード数 */
  tabletCards: number;
  /** モバイル時の表示カード数 */
  mobileCards: number;
  /** カード間のギャップ（px） */
  gap: number;
  /** スクロール時のアニメーション時間（ms） */
  scrollDuration: number;
}

/**
 * デフォルト設定
 */
export const DEFAULT_SCROLL_CONFIG: HorizontalScrollConfig = {
  desktopCards: 6,
  tabletCards: 4,
  mobileCards: 3,
  gap: 16,
  scrollDuration: 500
};

/**
 * スクロール位置情報
 */
export interface ScrollPosition {
  /** 現在のスクロール位置（px） */
  current: number;
  /** スクロール可能な最大値（px） */
  max: number;
  /** スクロール可能かどうか */
  canScroll: boolean;
  /** 左にスクロール可能か */
  canScrollLeft: boolean;
  /** 右にスクロール可能か */
  canScrollRight: boolean;
}