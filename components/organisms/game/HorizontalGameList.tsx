import React, { memo, useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Button,
  Center
} from "@chakra-ui/react";
import HorizontalScrollList from "@/components/molecules/HorizontalScrollList/HorizontalScrollList";
import { Game } from "@/types/game";
import { HorizontalScrollState } from "@/types/horizontalScroll";

interface HorizontalGameListProps {
  /** セクションタイトル */
  title: string;
  /** ゲーム一覧 */
  games: Game[];
  /** クリック時のハンドラー */
  onGameClick?: (gameId: string) => void;
  /** 読み込み中かどうか */
  isLoading?: boolean;
  /** エラー状態 */
  error?: string | null;
  /** エラー時の再試行コールバック */
  onRetry?: () => void;
}

/**
 * 横スクロールゲームリスト表示コンポーネント
 * 複数の状態（読み込み中、エラー、空）に対応
 * 
 * @example
 * ```tsx
 * <HorizontalGameList
 *   title="新作ゲーム"
 *   games={games}
 *   onGameClick={handleGameClick}
 *   isLoading={false}
 * />
 * ```
 */
const HorizontalGameList: React.FC<HorizontalGameListProps> = memo(({
  title,
  games,
  onGameClick,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const [state, setState] = useState<HorizontalScrollState>('loading');
  const [isMobileView, setIsMobileView] = useState(false);

  // モバイル判定
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /**
   * 状態を更新
   */
  useEffect(() => {
    if (isLoading) {
      setState('loading');
    } else if (error) {
      setState('error');
    } else if (games.length === 0) {
      setState('empty');
    } else {
      setState('success');
    }
  }, [isLoading, error, games.length]);

  const handleRetry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  return (
    <VStack gap={4} align="stretch">
      {/* セクションタイトル */}
      <Heading 
        as="h2" 
        size="lg" 
        color="white"
        fontWeight="bold"
      >
        {title}
      </Heading>

      {/* コンテンツエリア */}
      {state === 'loading' && (
        <HorizontalScrollList
          games={[]}
          isLoading={true}
          isMobile={isMobileView}
        />
      )}

      {state === 'success' && (
        <HorizontalScrollList
          games={games}
          isLoading={false}
          onGameClick={onGameClick}
          isMobile={isMobileView}
        />
      )}

      {state === 'empty' && (
        <Center py={16}>
          <VStack gap={4} textAlign="center">
            <Text fontSize="lg" color="whiteAlpha.700">
              ゲームがありません
            </Text>
            <Text fontSize="sm" color="whiteAlpha.600">
              ゲームデータを読み込んでください
            </Text>
          </VStack>
        </Center>
      )}

      {state === 'error' && (
        <Center py={16}>
          <VStack gap={4} textAlign="center">
            <Text fontSize="lg" color="red.400" fontWeight="bold">
              読み込みに失敗しました
            </Text>
            <Text fontSize="sm" color="whiteAlpha.600">
              {error || 'ゲームデータの読み込みに失敗しました。'}
            </Text>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={handleRetry}
              disabled={!onRetry}
            >
              再試行
            </Button>
          </VStack>
        </Center>
      )}
    </VStack>
  );
});

HorizontalGameList.displayName = 'HorizontalGameList';

export default HorizontalGameList;
