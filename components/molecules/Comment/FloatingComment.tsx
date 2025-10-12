import React, { memo } from 'react';
import { Box, Text } from "@chakra-ui/react";
import { FloatingComment as FloatingCommentType } from '../../../types/overlayComment';

interface FloatingCommentProps {
  /** コメントデータ */
  comment: FloatingCommentType;
  /** レーンの高さ（%） */
  laneHeight: number;
}

/**
 * 流れるコメント表示のMoleculeコンポーネント
 * 
 * @example
 * ```tsx
 * <FloatingComment comment={comment} laneHeight={5} />
 * ```
 */
const FloatingComment: React.FC<FloatingCommentProps> = memo(({ comment, laneHeight }) => {
  return (
    <Box
      position="absolute"
      top={`${comment.lane * laneHeight}%`}
      right="0"
      whiteSpace="nowrap"
      pointerEvents="none"
      animation={`slide-left ${comment.duration}s linear`}
      zIndex={1000}
      sx={{
        '@keyframes slide-left': {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(calc(-100vw - 100%))',
          },
        },
      }}
    >
      <Text
        color="white"
        fontSize="lg"
        fontWeight="bold"
        textShadow="2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8), 1px -1px 2px rgba(0,0,0,0.8), -1px 1px 2px rgba(0,0,0,0.8)"
        px={2}
      >
        {comment.content}
      </Text>
    </Box>
  );
});

FloatingComment.displayName = 'FloatingComment';

export default FloatingComment;