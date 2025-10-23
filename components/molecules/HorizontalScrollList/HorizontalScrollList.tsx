import React, { memo, useRef, useEffect } from 'react';
import { Box } from "@chakra-ui/react";
import { Game } from '../../../types/game';
import GameCard from '../../../atoms/Card/GameCard';
import CardSkeleton from '../../../atoms/Loading/CardSkeleton';
import ScrollButton from '../../../atoms/Button/ScrollButton';
import { useHorizontalScroll } from '../../../hooks/useHorizontalScroll';
import { DEFAULT_SCROLL_CONFIG } from '../../../types/horizontalScroll';

interface HorizontalScrollListProps {
  games: Game[];
  isLoading?: boolean;
  visibleCards?: number;
  onGameClick?: (gameId: string) => void;
  isMobile?: boolean;
}

/**
 * 横スクロールリストコンポーネント
 * Netflix風の横スクロール表示
 * 
 * @example
 * ```tsx
 * <HorizontalScrollList 
 *   games={games}
 *   isLoading={false}
 *   onGameClick={handleGameClick}
 * />
 * ```
 */
const HorizontalScrollList: React.FC<HorizontalScrollListProps> = memo(({
  games,
  isLoading = false,
  onGameClick,
  isMobile = false
}) => {
  const { 
    scrollRef, 
    scrollPosition, 
    scrollLeft, 
    scrollRight,
    visibleCards 
  } = useHorizontalScroll(DEFAULT_SCROLL_CONFIG, games.length);

  const containerRef = useRef<HTMLDivElement>(null);
  const [centerIndex, setCenterIndex] = React.useState(1);

  /**
   * モバイル時のスワイプ処理
   */
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const diff = touchStartX - touchEndX;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // 左スワイプ（右にスクロール）
          setCenterIndex(prev => Math.min(prev + 1, games.length - 1));
          scrollRight();
        } else {
          // 右スワイプ（左にスクロール）
          setCenterIndex(prev => Math.max(prev - 1, 0));
          scrollLeft();
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, games.length, scrollLeft, scrollRight]);

  return (
    <Box
      ref={containerRef}
      position="relative"
      w="full"
      overflow="hidden"
      pb={4}
    >
      {/* 左フェード効果 */}
      <Box
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        w="40px"
        bgGradient="linear(to-r, rgba(17, 24, 39, 1), rgba(17, 24, 39, 0))"
        zIndex={5}
        pointerEvents="none"
      />

      {/* 右フェード効果 */}
      <Box
        position="absolute"
        right={0}
        top={0}
        bottom={0}
        w="40px"
        bgGradient="linear(to-l, rgba(17, 24, 39, 1), rgba(17, 24, 39, 0))"
        zIndex={5}
        pointerEvents="none"
      />

      {/* スクロールコンテナ */}
      <Box
        ref={scrollRef}
        display="flex"
        gap={`${DEFAULT_SCROLL_CONFIG.gap}px`}
        overflowX="auto"
        overflowY="hidden"
        scrollBehavior="smooth"
        css={{
          '&::-webkit-scrollbar': {
            height: '4px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.5)'
            }
          }
        }}
        px={4}
      >
        {isLoading ? (
          <CardSkeleton count={visibleCards} />
        ) : (
          games.map((game, index) => {
            const isCenter = isMobile && index === centerIndex;
            // カード幅を計算（画面幅に応じて動的に）
            const cardWidth = `calc((100% - ${(visibleCards - 1) * DEFAULT_SCROLL_CONFIG.gap}px) / ${visibleCards})`;
            
            return (
              <Box
                key={game.id}
                flex={`0 0 ${cardWidth}`}
                minW={cardWidth}
                maxW={cardWidth}
              >
                <GameCard
                  game={game}
                  isCenter={isCenter}
                  onClick={() => {
                    if (isMobile) {
                      setCenterIndex(index);
                    }
                    onGameClick?.(game.id);
                  }}
                />
              </Box>
            );
          })
        )}
      </Box>

      {/* スクロールボタン（モバイル除外） */}
      {!isMobile && (
        <>
          <ScrollButton
            direction="left"
            onClick={scrollLeft}
            isDisabled={!scrollPosition.canScrollLeft}
          />
          <ScrollButton
            direction="right"
            onClick={scrollRight}
            isDisabled={!scrollPosition.canScrollRight}
          />
        </>
      )}
    </Box>
  );
});

HorizontalScrollList.displayName = 'HorizontalScrollList';

export default HorizontalScrollList;