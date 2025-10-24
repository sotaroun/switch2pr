import { useRef, useState, useCallback, useEffect } from 'react';
import { ScrollPosition, HorizontalScrollConfig } from "@/types/horizontalScroll";
import { HORIZONTAL_SCROLL_UI } from "@/components/molecules/HorizontalScrollList/config";

interface UseHorizontalScrollReturn {
  /** スクロールコンテナRef */
  scrollRef: React.RefObject<HTMLDivElement | null>;
  /** スクロール位置情報 */
  scrollPosition: ScrollPosition;
  /** 左にスクロール */
  scrollLeft: () => void;
  /** 右にスクロール */
  scrollRight: () => void;
  /** 表示カード数 */
  visibleCards: number;
  /** 1カード分のスクロール距離 */
  cardScrollDistance: number;
}

/**
 * 横スクロール管理フック
 */
export function useHorizontalScroll(
  config: HorizontalScrollConfig,
  itemCount: number
): UseHorizontalScrollReturn {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    current: 0,
    max: 0,
    canScroll: false,
    canScrollLeft: false,
    canScrollRight: false
  });
  const [visibleCards, setVisibleCards] = useState(config.desktopCards);

  /**
   * スクロール位置を更新
   */
  const updateScrollPosition = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const max = scrollWidth - clientWidth;

    setScrollPosition({
      current: scrollLeft,
      max,
      canScroll: max > 0,
      canScrollLeft: scrollLeft > 0,
      canScrollRight: scrollLeft < max
    });
  }, []);

  /**
   * 表示カード数を計算（ウィンドウサイズに応じて）
   */
  const calculateVisibleCards = useCallback(() => {
    if (typeof window === 'undefined') return config.desktopCards;

    const width = window.innerWidth;
    if (width < 768) return config.mobileCards;
    if (width < 1024) return config.tabletCards;
    return config.desktopCards;
  }, [config]);

  /**
   * 1カード分のスクロール距離を計算
   */
  const getCardScrollDistance = useCallback((): number => {
    if (!scrollRef.current) return 0;

    const { scrollWidth, clientWidth } = scrollRef.current;
    const cardWidth = clientWidth / visibleCards;
    return cardWidth + config.gap;
  }, [visibleCards, config.gap]);

  /**
   * 左にスクロール
   */
  const scrollLeft = useCallback(() => {
    if (!scrollRef.current) return;

    const distance = getCardScrollDistance();
    scrollRef.current.scrollBy({
      left: -distance,
      behavior: 'smooth'
    });

    setTimeout(updateScrollPosition, config.scrollDuration);
  }, [config.scrollDuration, getCardScrollDistance, updateScrollPosition]);

  /**
   * 右にスクロール
   */
  const scrollRight = useCallback(() => {
    if (!scrollRef.current) return;

    const distance = getCardScrollDistance();
    scrollRef.current.scrollBy({
      left: distance,
      behavior: 'smooth'
    });

    setTimeout(updateScrollPosition, config.scrollDuration);
  }, [config.scrollDuration, getCardScrollDistance, updateScrollPosition]);

  /**
   * ウィンドウリサイズ時の処理
   */
  useEffect(() => {
    const handleResize = () => {
      const newVisibleCards = calculateVisibleCards();
      setVisibleCards(newVisibleCards);
      updateScrollPosition();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateVisibleCards, updateScrollPosition]);

  /**
   * 初期化
   */
  useEffect(() => {
    setVisibleCards(calculateVisibleCards());
    updateScrollPosition();
  }, [calculateVisibleCards, updateScrollPosition]);

  /**
   * スクロール中のリッスン
   */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener('scroll', updateScrollPosition);
    return () => container.removeEventListener('scroll', updateScrollPosition);
  }, [updateScrollPosition]);

  return {
    scrollRef,
    scrollPosition,
    scrollLeft,
    scrollRight,
    visibleCards,
    cardScrollDistance: getCardScrollDistance()
  };
}
