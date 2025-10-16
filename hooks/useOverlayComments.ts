import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { OverlayComment, FloatingComment } from '../types/overlayComment';
import { logger } from '../lib/utils/logger';
import { overlayCommentsClient } from '../lib/api/overlayCommentsClient';
import {
  ANIMATION_CONFIG,
  RENDERING_CONFIG,
  getDurationByLength
} from '../lib/constants/overlayComments';

interface UseOverlayCommentsOptions {
  gameId: string | null;
  fetchComments: (gameId: string) => Promise<OverlayComment[]>;
  maxDisplay?: number;
  totalLanes?: number;
  initialBurst?: number;
}

interface UseOverlayCommentsReturn {
  comments: FloatingComment[];
  isHovered: boolean;
  isLoading: boolean;
  error: string | null;
  startHover: () => void;
  endHover: () => void;
}

/**
 * ランダムなフォントサイズを取得
 */
function getRandomFontSize(): number {
  const sizes = RENDERING_CONFIG.FONT_SIZES;
  return sizes[Math.floor(Math.random() * sizes.length)];
}

/**
 * ランダムで重複しないレーンを取得
 */
function getRandomLane(usedLanes: Set<number>, totalLanes: number): number {
  const availableLanes = Array.from({ length: totalLanes }, (_, i) => i).filter(
    i => !usedLanes.has(i)
  );

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
 * const { comments, startHover, endHover, isLoading } = useOverlayComments({
 *   gameId: 'game-123',
 *   fetchComments: fetchOverlayCommentsAPI,
 *   maxDisplay: 20
 * });
 * ```
 */
export function useOverlayComments({
  gameId,
  fetchComments,
  maxDisplay = RENDERING_CONFIG.MAX_DISPLAY_COMMENTS,
  totalLanes = RENDERING_CONFIG.TOTAL_LANES,
  initialBurst = RENDERING_CONFIG.INITIAL_BURST_COUNT
}: UseOverlayCommentsOptions): UseOverlayCommentsReturn {
  const [comments, setComments] = useState<FloatingComment[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableComments, setAvailableComments] = useState<OverlayComment[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const commentCounterRef = useRef(0);
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * コメントを取得
   */
  const loadComments = useCallback(async () => {
    if (!gameId || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      logger.debug('コメント取得開始', { gameId });
      
      const result = await overlayCommentsClient.getComments(gameId);

      if (result.success) {
        setAvailableComments(result.data);
        logger.info('コメント取得成功', { count: result.data.length });
      } else {
        const errorMessage = result.error.message;
        setError(errorMessage);
        logger.warn('コメント取得エラー', { error: result.error });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラー';
      setError(errorMessage);
      logger.error('コメント取得中に予期しないエラー', err);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [gameId]);

  /**
   * コメント追加のロジック
   * 純粋関数化して再利用性を向上
   */
  const addComment = useCallback(() => {
    if (availableComments.length === 0) return;
    if (comments.length >= maxDisplay) return;

    const randomComment =
      availableComments[Math.floor(Math.random() * availableComments.length)];

    const usedLanes = new Set(comments.map(c => c.lane));
    const lane = getRandomLane(usedLanes, totalLanes);
    const duration = getDurationByLength(randomComment.content.length);
    const fontSize = getRandomFontSize();

    const floatingComment: FloatingComment = {
      ...randomComment,
      lane,
      duration,
      fontSize,
      key: `${randomComment.id}-${commentCounterRef.current++}`
    };

    setComments(prev => [...prev, floatingComment]);

    // アニメーション完全終了まで待機
    const timeoutId = setTimeout(() => {
      setComments(prev => prev.filter(c => c.key !== floatingComment.key));
    }, (duration + ANIMATION_CONFIG.ANIMATION_END_BUFFER_SEC) * 1000);

    return timeoutId;
  }, [availableComments, comments.length, maxDisplay, totalLanes]);

  /**
   * 初期バースト処理
   */
  const initialBurstComments = useCallback(() => {
    logger.debug('初期バースト開始', { count: initialBurst });

    for (let i = 0; i < initialBurst; i++) {
      setTimeout(() => {
        addComment();
      }, i * ANIMATION_CONFIG.BURST_INTERVAL_MS);
    }
  }, [addComment, initialBurst]);

  /**
   * 定期的なコメント追加をスケジュール
   */
  const scheduleNextComment = useCallback(() => {
    const delay =
      ANIMATION_CONFIG.NEXT_COMMENT_DELAY_MIN_MS +
      Math.random() * (ANIMATION_CONFIG.NEXT_COMMENT_DELAY_MAX_MS - ANIMATION_CONFIG.NEXT_COMMENT_DELAY_MIN_MS);

    intervalRef.current = setTimeout(() => {
      addComment();
      scheduleNextComment(); // 再帰的に次をスケジュール
    }, delay);
  }, [addComment]);

  /**
   * ホバー開始
   */
  const startHover = useCallback(async () => {
    logger.debug('ホバー開始');
    setIsHovered(true);

    // コメント未取得時のみ取得
    if (availableComments.length === 0) {
      await loadComments();
    }

    // ロード完了を待ってからアニメーション開始
    setTimeout(() => {
      initialBurstComments();
    }, ANIMATION_CONFIG.INITIAL_BURST_DELAY_MS);

    // 定期表示開始
    setTimeout(() => {
      scheduleNextComment();
    }, ANIMATION_CONFIG.PERIODIC_START_DELAY_MS);
  }, [availableComments.length, loadComments, initialBurstComments, scheduleNextComment]);

  /**
   * ホバー終了
   */
  const endHover = useCallback(() => {
    logger.debug('ホバー終了');
    setIsHovered(false);

    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setComments([]);
  }, []);

  /**
   * クリーンアップ
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * prefers-reduced-motion対応
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        logger.debug('アニメーション削減モード有効');
        endHover();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [endHover]);

  return useMemo(() => ({
    comments,
    isHovered,
    isLoading,
    error,
    startHover,
    endHover
  }), [comments, isHovered, isLoading, error, startHover, endHover]);
}