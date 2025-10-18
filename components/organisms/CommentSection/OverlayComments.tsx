import React, { memo } from 'react';
import { Box } from "@chakra-ui/react";
import FloatingComment from '../../molecules/Comment/FloatingComment';
import { FloatingComment as FloatingCommentType } from '../../../types/overlayComment';

interface OverlayCommentsProps {
  /** 表示するコメント一覧 */
  comments: FloatingCommentType[];
  /** レーン数 */
  totalLanes?: number;
    /** コメント読み込み中フラグ（オプション） */
  isLoading?: boolean;
}

/**
 * オーバーレイコメント表示のOrganismコンポーネント
 * ニコニコ動画風にコメントを流す
 * 
 * @example
 * ```tsx
 * <OverlayComments comments={floatingComments} totalLanes={20} />
 * ```
 */
const OverlayComments: React.FC<OverlayCommentsProps> = memo(({ 
  comments,
  totalLanes = 20 
}) => {
  const laneHeight = 100 / totalLanes;

  if (comments.length === 0) {
    return null;
  }

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      pointerEvents="none"
      zIndex={9999}
      overflow="hidden"
    >
      {comments.map((comment) => (
        <FloatingComment
          key={comment.key}
          comment={comment}
          laneHeight={laneHeight}
        />
      ))}
    </Box>
  );
});

OverlayComments.displayName = 'OverlayComments';

export default OverlayComments;