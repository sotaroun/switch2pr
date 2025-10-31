import React, { memo, useRef, useEffect, useMemo } from 'react';
import { Box, Spinner } from "@chakra-ui/react";
import { Game } from "@/types/game";
import GameCard from "../GameCard/GameCard";
import CardSkeleton from "@/components/atoms/loading/CardSkeleton";
import ScrollButton from "@/components/atoms/buttons/ScrollButton";
import { useHorizontalScroll } from "@/hooks/ui/useHorizontalScroll";
import { DEFAULT_SCROLL_CONFIG } from "./config";

interface HorizontalScrollListProps {
  games: Game[];
  isLoading?: boolean;
  visibleCards?: number;
  onGameClick?: (gameId: string) => void;
  isMobile?: boolean;
  onGameHover?: (gameId: string) => void;
  onGameLeave?: () => void;
  onEndReached?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
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
  isMobile = false,
  onGameHover,
  onGameLeave,
  onEndReached,
  hasMore = false,
  isLoadingMore = false,
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
  const isMountedRef = useRef(false);
  const cardWidth = useMemo(() => {
    if (!visibleCards || visibleCards <= 0) {
      return "200px";
    }
    return `calc((100% - ${(visibleCards - 1) * DEFAULT_SCROLL_CONFIG.gap}px) / ${visibleCards})`;
  }, [visibleCards]);

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

  useEffect(() => {
    if (!onEndReached || !scrollRef.current) return;
    const node = scrollRef.current;
    const threshold = 200;

    const handleScroll = () => {
      if (!hasMore || isLoadingMore) return;
      if (node.scrollWidth - (node.scrollLeft + node.clientWidth) <= threshold) {
        onEndReached();
      }
    };

    node.addEventListener("scroll", handleScroll);
    return () => {
      node.removeEventListener("scroll", handleScroll);
    };
  }, [onEndReached, hasMore, isLoadingMore, scrollRef]);

  useEffect(() => {
    if (!onEndReached || !hasMore || isLoadingMore) return;
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      if (games.length === 0) {
        onEndReached();
      }
      return;
    }
    if (games.length > 0 && games.length <= visibleCards) {
      onEndReached();
    }
  }, [games.length, visibleCards, hasMore, isLoadingMore, onEndReached]);

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
          <>
            {games.map((game, index) => {
              const isCenter = isMobile && index === centerIndex;
              
              return (
                <Box
                  key={game.id}
                  flex={`0 0 ${cardWidth}`}
                  minW={cardWidth}
                  maxW={cardWidth}
                >
                <GameCard
                  title={game.title}
                  categories={game.categories}
                  iconUrl={game.iconUrl}
                  isCenter={isCenter}
                  compact={true}
                  onClick={() => {
                    if (isMobile) {
                      setCenterIndex(index);
                    }
                    onGameClick?.(game.id);
                  }}
                  onMouseEnter={() => {
                    onGameHover?.(game.id);
                  }}
                  onMouseLeave={() => {
                    onGameLeave?.();
                  }}
                />
              </Box>
            );
            })}
            {isLoadingMore && hasMore && (
              <Box
                key="loader"
                flex={`0 0 ${cardWidth}`}
                minW={cardWidth}
                maxW={cardWidth}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {isLoadingMore ? <Spinner /> : null}
              </Box>
            )}
          </>
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
