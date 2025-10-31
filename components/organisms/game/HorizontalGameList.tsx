import React, { memo, useState, useCallback, useEffect } from 'react';
import { 
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
  /** マウスホバー時のハンドラー */
  onGameHover?: (gameId: string) => void;
  /** ホバー解除時のハンドラー */
  onGameLeave?: () => void;
  /** 無限スクロール用の追加読み込みコールバック */
  onLoadMore?: () => void;
  /** 追加データが存在するか */
  hasMore?: boolean;
  /** 追加読み込み中か */
  isLoadingMore?: boolean;
  /** データが空の場合のメッセージ */
  emptyMessage?: string;
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
  onRetry,
  onGameHover,
  onGameLeave,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  emptyMessage,
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
          onGameHover={onGameHover}
          onGameLeave={onGameLeave}
          onEndReached={onLoadMore}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
        />
      )}

      {state === 'empty' && (
        <Center py={16}>
          <VStack gap={4} textAlign="center">
            <Text fontSize="lg" color="whiteAlpha.700">
              {emptyMessage ?? "ゲームがありません"}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.600">
              {emptyMessage
                ? "管理画面で表示設定を確認してください"
                : "ゲームデータを読み込んでください"}
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
