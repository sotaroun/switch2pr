import { useState, useCallback, useEffect, useRef } from 'react';
import { OverlayComment, FloatingComment } from '../types/overlayComment';

interface UseOverlayCommentsOptions {
  /** ゲームID */
  gameId: string | null;
  /** コメント取得関数 */
  fetchComments: (gameId: string) => Promise<OverlayComment[]>;
  /** 同時表示最大数 */
  maxDisplay?: number;
  /** レーン数 */
  totalLanes?: number;
}

interface UseOverlayCommentsReturn {
  /** 表示中のコメント */
  comments: FloatingComment[];
  /** ホバー状態 */
  isHovered: boolean;
  /** ホバー開始 */
  startHover: () => void;
  /** ホバー終了 */
  endHover: () => void;
}

/**
 * 文字数に応じたアニメーション時間を計算
 * @param length - 文字数
 * @returns アニメーション時間（秒）
 */
function calculateDuration(length: number): number {
  if (length <= 10) return 4;
  if (length <= 20) return 6;
  if (length <= 30) return 8;
  return 10;
}

/**
 * ランダムなレーンを取得（重複を避ける）
 * @param usedLanes - 使用中のレーン
 * @param totalLanes - 総レーン数
 * @returns レーン番号
 */
function getRandomLane(usedLanes: Set<number>, totalLanes: number): number {
  const availableLanes: number[] = [];
  for (let i = 0; i < totalLanes; i++) {
    if (!usedLanes.has(i)) {
      availableLanes.push(i);
    }
  }
  
  // 空きレーンがなければランダムに選択
  if (availableLanes.length === 0) {
    return Math.floor(Math.random() * totalLanes);
  }
  
  return availableLanes[Math.floor(Math.random() * availableLanes.length)];
}

/**
 * オーバーレイコメント機能を提供するカスタムフック
 * 
 * @example
 * ```tsx
 * const { comments, isHovered, startHover, endHover } = useOverlayComments({
 *   gameId: hoveredGameId,
 *   fetchComments: fetchOverlayComments
 * });
 * ```
 */
export function useOverlayComments({
  gameId,
  fetchComments,
  maxDisplay = 20,
  totalLanes = 20
}: UseOverlayCommentsOptions): UseOverlayCommentsReturn {
  const [comments, setComments] = useState<FloatingComment[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [availableComments, setAvailableComments] = useState<OverlayComment[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const commentCounterRef = useRef(0);

  /**
   * コメントをフェッチ
   */
  useEffect(() => {
    if (gameId && isHovered) {
      fetchComments(gameId).then(setAvailableComments);
    }
  }, [gameId, isHovered, fetchComments]);

  /**
   * コメントを追加
   */
  const addComment = useCallback(() => {
    if (availableComments.length === 0) return;
    if (comments.length >= maxDisplay) return;

    // ランダムにコメントを選択
    const randomComment = availableComments[
      Math.floor(Math.random() * availableComments.length)
    ];

    // 使用中のレーンを取得
    const usedLanes = new Set(comments.map(c => c.lane));
    const lane = getRandomLane(usedLanes, totalLanes);
    const duration = calculateDuration(randomComment.content.length);

    const floatingComment: FloatingComment = {
      ...randomComment,
      lane,
      duration,
      key: `${randomComment.id}-${commentCounterRef.current++}`
    };

    setComments(prev => [...prev, floatingComment]);

    // アニメーション終了後に削除
    setTimeout(() => {
      setComments(prev => prev.filter(c => c.key !== floatingComment.key));
    }, duration * 1000);
  }, [availableComments, comments.length, maxDisplay, totalLanes]);

  /**
   * ホバー開始
   */
  const startHover = useCallback(() => {
    setIsHovered(true);
    
    // 定期的にコメントを追加（500-1500msランダム間隔）
    const scheduleNext = () => {
      const delay = 500 + Math.random() * 1000;
      intervalRef.current = setTimeout(() => {
        addComment();
        scheduleNext();
      }, delay);
    };
    
    scheduleNext();
  }, [addComment]);

  /**
   * ホバー終了
   * 新規コメント追加を停止（既存は流れ切るまで表示）
   */
  const endHover = useCallback(() => {
    setIsHovered(false);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * クリーンアップ
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  return {
    comments,
    isHovered,
    startHover,
    endHover
  };
}