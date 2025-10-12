import React, { useCallback, useEffect } from 'react';
import { Box, Stack, Text, Button, Flex } from "@chakra-ui/react";
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import CommentItem from '../../molecules/Comment/CommentItem';
import Spinner from '../../../atoms/Loading/Spinner';
import { Comment, InfiniteScrollResult } from '../../../types/comment';

interface InfiniteCommentListProps {
  /** ゲームID */
  gameId: string;
  /** データ取得関数 */
  fetchComments: (
    gameId: string, 
    cursor: string | null
  ) => Promise<InfiniteScrollResult<Comment>>;
  /** コメントクリック時のハンドラー（オプション） */
  onCommentClick?: (commentId: string) => void;
  /** 空の場合のメッセージ */
  emptyMessage?: string;
  /** エラーメッセージのカスタマイズ */
  errorMessage?: string;
}

/**
 * 無限スクロール対応のコメント一覧表示Organismコンポーネント
 * - 自動的に次ページを読み込み
 * - 二重読み込み防止
 * - エラーハンドリングと再試行機能
 * - 末尾到達の明示
 * 
 * @example
 * ```tsx
 * <InfiniteCommentList
 *   gameId="game-123"
 *   fetchComments={fetchCommentsAPI}
 *   onCommentClick={(id) => router.push(`/comment/${id}`)}
 *   emptyMessage="まだコメントがありません"
 * />
 * ```
 */
const InfiniteCommentList: React.FC<InfiniteCommentListProps> = ({
  gameId,
  fetchComments,
  onCommentClick,
  emptyMessage = "まだコメントがありません",
  errorMessage = "コメントの読み込みに失敗しました"
}) => {
  /**
   * データ取得関数をラップ
   * gameIdを含めた形でfetchCommentsを呼び出す
   */
  const handleLoadMore = useCallback(
    (cursor: string | null) => fetchComments(gameId, cursor),
    [gameId, fetchComments]
  );

  const {
    data: comments,
    isLoading,
    error,
    hasMore,
    observerRef,
    loadMore,
    reset
  } = useInfiniteScroll<Comment>({
    onLoadMore: handleLoadMore,
    initialData: []
  });

  /**
   * 初回読み込み
   * コンポーネントマウント時、データが空の場合のみ実行
   */
  useEffect(() => {
    if (comments.length === 0 && !isLoading && !error) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * エラー時の再試行処理
   */
  const handleRetry = useCallback(() => {
    reset();
    loadMore();
  }, [reset, loadMore]);

  return (
    <Box w="full" as="section" aria-label="コメント一覧">
      <Stack direction="column" gap={4}>
        {/* コメント一覧 */}
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onClick={onCommentClick}
          />
        ))}

        {/* 空状態 */}
        {comments.length === 0 && !isLoading && !error && (
          <Box textAlign="center" py={12} role="status">
            <Text color="gray.400" fontSize="lg">
              {emptyMessage}
            </Text>
          </Box>
        )}

        {/* エラー表示 */}
        {error && (
          <Box
            bg="red.900"
            borderRadius="md"
            borderWidth="1px"
            borderColor="red.700"
            p={4}
            role="alert"
            aria-live="assertive"
          >
            <Stack direction="column" gap={3}>
              <Flex align="center" gap={2}>
                <Text fontSize="lg" aria-hidden="true">⚠️</Text>
                <Text color="white" fontSize="sm" fontWeight="semibold">
                  エラーが発生しました
                </Text>
              </Flex>
              <Text color="red.200" fontSize="sm">
                {error.message || errorMessage}
              </Text>
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={handleRetry}
                aria-label="コメントの読み込みを再試行"
              >
                再試行
              </Button>
            </Stack>
          </Box>
        )}

        {/* 読み込み中インジケータ */}
        {isLoading && (
          <Spinner size="lg" message="読み込み中..." />
        )}

        {/* 監視ポイント（画面下部到達検知） */}
        {hasMore && !isLoading && !error && (
          <Box 
            ref={observerRef} 
            h="20px" 
            aria-hidden="true"
          />
        )}

        {/* 末尾到達表示 */}
        {!hasMore && comments.length > 0 && (
          <Box 
            textAlign="center" 
            py={8} 
            borderTopWidth="1px" 
            borderColor="gray.700"
            role="status"
            aria-live="polite"
          >
            <Text color="gray.400" fontSize="sm">
              すべてのコメントを表示しました
            </Text>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default InfiniteCommentList;