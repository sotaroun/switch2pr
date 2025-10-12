import React, { memo, useCallback } from 'react';
import { Box, Stack, Text, Flex } from "@chakra-ui/react";
import { Comment } from '../../../types/comment';

interface CommentItemProps {
  /** コメントデータ */
  comment: Comment;
  /** クリック時のハンドラー（オプション） */
  onClick?: (commentId: string) => void;
}

/**
 * 個別コメント表示のMoleculeコンポーネント
 * - 投稿者名と投稿日時を表示
 * - いいね数の表示（オプション）
 * - クリック可能（オプション）
 * 
 * @example
 * ```tsx
 * <CommentItem 
 *   comment={comment} 
 *   onClick={(id) => console.log(id)} 
 * />
 * ```
 */
const CommentItem: React.FC<CommentItemProps> = memo(({ comment, onClick }) => {
  /**
   * 日付をフォーマット
   */
  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(comment.id);
    }
  }, [onClick, comment.id]);

  return (
    <Box
      bg="gray.800"
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.700"
      p={4}
      _hover={{ 
        bg: onClick ? "gray.750" : "gray.800", 
        borderColor: onClick ? "gray.600" : "gray.700" 
      }}
      transition="all 0.2s ease"
      cursor={onClick ? "pointer" : "default"}
      onClick={handleClick}
      role={onClick ? "button" : "article"}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
      aria-label={onClick ? `${comment.author}のコメントを表示` : undefined}
    >
      <Stack direction="column" gap={2}>
        {/* ヘッダー: 投稿者と日時 */}
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
          <Text color="blue.400" fontSize="sm" fontWeight="semibold">
            {comment.author}
          </Text>
          <Text color="gray.500" fontSize="xs">
            {formatDate(comment.createdAt)}
          </Text>
        </Flex>

        {/* コメント内容 */}
        <Text color="white" fontSize="sm" lineHeight="1.6" wordBreak="break-word">
          {comment.content}
        </Text>

        {/* いいね数（オプション） */}
        {comment.likes !== undefined && (
          <Flex align="center" gap={1}>
            <Text fontSize="sm" aria-label={`${comment.likes}いいね`}>
              👍
            </Text>
            <Text color="gray.400" fontSize="xs">
              {comment.likes}
            </Text>
          </Flex>
        )}
      </Stack>
    </Box>
  );
});

CommentItem.displayName = 'CommentItem';

export default CommentItem;