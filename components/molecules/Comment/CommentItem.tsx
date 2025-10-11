import React, { memo } from 'react';
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
 * 
 * @example
 * ```tsx
 * <CommentItem comment={comment} onClick={handleClick} />
 * ```
 */
const CommentItem: React.FC<CommentItemProps> = memo(({ comment, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(comment.id);
    }
  };

  return (
    <Box
      bg="gray.800"
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.700"
      p={4}
      _hover={{ bg: "gray.750", borderColor: "gray.600" }}
      transition="all 0.2s"
      cursor={onClick ? "pointer" : "default"}
      onClick={handleClick}
    >
      <Stack direction="column" gap={2}>
        {/* ヘッダー: 投稿者と日時 */}
        <Flex justify="space-between" align="center">
          <Text color="blue.400" fontSize="sm" fontWeight="semibold">
            {comment.author}
          </Text>
          <Text color="gray.500" fontSize="xs">
            {new Date(comment.createdAt).toLocaleDateString('ja-JP')}
          </Text>
        </Flex>

        {/* コメント内容 */}
        <Text color="white" fontSize="sm" lineHeight="1.6">
          {comment.content}
        </Text>

        {/* いいね数（オプション） */}
        {comment.likes !== undefined && (
          <Text color="gray.400" fontSize="xs">
            👍 {comment.likes}
          </Text>
        )}
      </Stack>
    </Box>
  );
});

CommentItem.displayName = 'CommentItem';

export default CommentItem;