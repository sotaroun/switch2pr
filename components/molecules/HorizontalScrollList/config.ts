import type { HorizontalScrollConfig } from "@/types/horizontalScroll";

export const DEFAULT_SCROLL_CONFIG: HorizontalScrollConfig = {
  desktopCards: 6,
  tabletCards: 4,
  mobileCards: 3,
  gap: 16,
  scrollDuration: 500,
};

export const HORIZONTAL_SCROLL_UI = {
  CARD_HEIGHT: 250,
  FADE_WIDTH: 40,
  SCROLLBAR_HEIGHT: 4,
  Z_INDEX: {
    FADE: 5,
    BUTTON: 10,
  },
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
  },
  SWIPE_THRESHOLD: 50,
} as const;
