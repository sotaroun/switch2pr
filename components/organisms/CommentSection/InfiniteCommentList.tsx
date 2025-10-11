// components/organisms/CommentSection/InfiniteCommentList.tsx

import React, { useCallback } from 'react';
import { Box, Stack, Text, Button } from "@chakra-ui/react";
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import CommentItem from '../../molecules/Comment/CommentItem';
import Spinner from '../../../atoms/Loading/Spinner';
import { Comment } from '../../../types/comment';

interface InfiniteCommentListProps {
  /** ゲームID */
  gameId: string;
  /** データ取得関数 */
  fetchComments: (gameId: string, cursor: string | null) => Promise<{
    data: Comment[];
    nextCursor: string | null;
    hasMore: boolean;
  }>;
  /** コメントクリック時のハンドラー（オプション） */
  onCommentClick?: (commentId: string) => void;
  /** 空の場合のメッセージ */
  emptyMessage?: string;
}

/**
 * 無限スクロール対応のコメント一覧表示Organismコンポーネント
 * 
 * @example
 * ```tsx
 * <InfiniteCommentList
 *   gameId="game-123"
 *   fetchComments={fetchCommentsAPI}
 *   onCommentClick={handleCommentClick}
 * />
 * ```
 */
const InfiniteCommentList: React.FC<InfiniteCommentListProps> = ({
  gameId,
  fetchComments,
  onCommentClick,
  emptyMessage = "まだコメントがありません"
}) => {
  // データ取得関数をラップ
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

  // 初回読み込み
  React.useEffect(() => {
    if (comments.length === 0 && !isLoading) {
      loadMore();
    }
  }, []);

  return (
    <Box w="full">
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
          <Box textAlign="center" py={12}>
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
          >
            <Stack direction="column" gap={3}>
              <Text color="white" fontSize="sm" fontWeight="semibold">
                ⚠️ エラーが発生しました
              </Text>
              <Text color="red.200" fontSize="sm">
                {error.message}
              </Text>
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={() => {
                  reset();
                  loadMore();
                }}
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
        {hasMore && !isLoading && (
          <Box ref={observerRef} h="20px" />
        )}

        {/* 末尾到達表示 */}
        {!hasMore && comments.length > 0 && (
          <Box textAlign="center" py={8} borderTopWidth="1px" borderColor="gray.700">
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