import React, { memo } from 'react';
import { Box, Text } from "@chakra-ui/react";
import { keyframes } from '@emotion/react';
import { FloatingComment as FloatingCommentType } from '../../../types/overlayComment';

interface FloatingCommentProps {
  /** コメントデータ */
  comment: FloatingCommentType;
  /** レーンの高さ（%） */
  laneHeight: number;
}

// アニメーション定義（完全に画面外に出るまで）
const slideLeft = keyframes`
  from {
    transform: translateX(100vw);
  }
  to {
    transform: translateX(calc(-100vw - 100%));
  }
`;

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
      right="0"
      whiteSpace="nowrap"
      pointerEvents="none"
      zIndex={1000}
      css={{
        animation: `${slideLeft} ${comment.duration}s linear forwards`,
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