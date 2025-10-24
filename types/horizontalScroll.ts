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
 * UI定数
 */
export const HORIZONTAL_SCROLL_UI = {
  CARD_HEIGHT: 250,
  FADE_WIDTH: 40,
  SCROLLBAR_HEIGHT: 4,
  Z_INDEX: {
    FADE: 5,
    BUTTON: 10
  },
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024
  },
  SWIPE_THRESHOLD: 50
} as const;

/**
 * カテゴリ別グラデーション
 */
export const CATEGORY_GRADIENTS: Record<string, string> = {
  'アクション': 'linear(to-br, red.600, red.900)',
  'RPG': 'linear(to-br, purple.600, purple.900)',
  'シューティング': 'linear(to-br, blue.600, blue.900)',
  'スポーツ': 'linear(to-br, green.600, green.900)',
  'パズル': 'linear(to-br, yellow.600, yellow.900)'
} as const;

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