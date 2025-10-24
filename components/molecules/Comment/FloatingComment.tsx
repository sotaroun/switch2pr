import React, { memo } from 'react';
import { Box, Text } from "@chakra-ui/react";
import { FloatingComment as FloatingCommentType } from "@/types/overlayComment";

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
      position="fixed"
      top={`${comment.lane * laneHeight}%`}
      left="88vw"
      whiteSpace="nowrap"
      pointerEvents="none"
      zIndex={1000}
      backgroundColor="rgba(0,0,0,0.5)"
      borderRadius="md"
      display="inline-flex"
      alignItems="center"
      style={{
        animation: `overlay-slide-left ${comment.duration}s linear ${comment.delay}s forwards`,
        transform: "translateX(0)",
        willChange: "transform",
      }}
    >
      <Text
        color="white"
        fontSize={`${comment.fontSize}px`}
        fontWeight="bold"
        textShadow="2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9), 1px -1px 2px rgba(0,0,0,0.9), -1px 1px 2px rgba(0,0,0,0.9)"
        px={2}
      >
        {comment.content}
      </Text>
    </Box>
  );
});

FloatingComment.displayName = 'FloatingComment';

export default FloatingComment;
