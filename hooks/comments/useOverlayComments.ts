import { useState, useCallback, useEffect, useRef } from 'react';
import { OverlayComment, FloatingComment } from "@/types/overlayComment";

interface UseOverlayCommentsOptions {
  gameId: string | null;
  fetchComments: (gameId: string) => Promise<OverlayComment[]>;
  maxDisplay?: number;
  totalLanes?: number;
  initialBurst?: number;
  prefetchedComments?: OverlayComment[];
}

interface UseOverlayCommentsReturn {
  comments: FloatingComment[];
  isHovered: boolean;
  isLoading: boolean;
  startHover: () => void;
  endHover: () => void;
}

function calculateDuration(length: number): number {
  if (length <= 10) return 12;
  if (length <= 20) return 18;
  if (length <= 30) return 24;
  return 30;
}

function getRandomFontSize(): number {
  const sizes = [14, 16, 18, 20, 24, 28];
  return sizes[Math.floor(Math.random() * sizes.length)];
}

function getRandomLane(usedLanes: Set<number>, totalLanes: number): number {
  const availableLanes: number[] = [];
  for (let i = 0; i < totalLanes; i++) {
    if (!usedLanes.has(i)) {
      availableLanes.push(i);
    }
  }
  
  if (availableLanes.length === 0) {
    return Math.floor(Math.random() * totalLanes);
  }
  
  return availableLanes[Math.floor(Math.random() * availableLanes.length)];
}

export function useOverlayComments({
  gameId,
  fetchComments,
  maxDisplay = 20,
  totalLanes = 20,
  initialBurst = 10,
  prefetchedComments,
}: UseOverlayCommentsOptions): UseOverlayCommentsReturn {
  const [comments, setComments] = useState<FloatingComment[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableComments, setAvailableComments] = useState<OverlayComment[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const commentCounterRef = useRef(0);
  const isFetchingRef = useRef(false);
  // 重要: availableCommentsをRefで管理して、常に最新値を参照
  const availableCommentsRef = useRef<OverlayComment[]>([]);

  // availableCommentsが更新されたら、Refも更新
  useEffect(() => {
    availableCommentsRef.current = availableComments;
  }, [availableComments]);

  /**
   * コメントをフェッチ
   */
  const loadComments = useCallback(async () => {
    if (!gameId || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    console.log('🔄 コメント読み込み開始');

    try {
      const comments = await fetchComments(gameId);
      setAvailableComments(comments);
      console.log('✅ コメント読み込み完了:', comments.length);
    } catch (error) {
      console.error('❌ コメント読み込み失敗:', error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [gameId, fetchComments]);

  useEffect(() => {
    setComments([]);
    setAvailableComments([]);
    availableCommentsRef.current = [];
    commentCounterRef.current = 0;
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, [gameId]);

  useEffect(() => {
    if (prefetchedComments && prefetchedComments.length > 0) {
      setAvailableComments(prefetchedComments);
      availableCommentsRef.current = prefetchedComments;
    }
  }, [prefetchedComments]);

  /**
   * コメント追加 - Refを使用して常に最新のコメント一覧を参照
   */
  const addComment = useCallback(() => {
    // Refから最新値を参照（依存配列に入らない）
    const currentAvailableComments = availableCommentsRef.current;
    
    if (currentAvailableComments.length === 0) {
      return;
    }

    setComments(prev => {
      // 同時表示最大数に達していないか確認
      if (prev.length >= maxDisplay) {
        return prev;
      }

      const randomComment = currentAvailableComments[
        Math.floor(Math.random() * currentAvailableComments.length)
      ];

      const usedLanes = new Set(prev.map(c => c.lane));
      const lane = getRandomLane(usedLanes, totalLanes);
      const duration = calculateDuration(randomComment.content.length);
      const fontSize = getRandomFontSize();

      const floatingComment: FloatingComment = {
        ...randomComment,
        lane,
        duration,
        fontSize,
        delay: 0,
        key: `${randomComment.id}-${commentCounterRef.current++}`
      };

      // アニメーション完全終了まで待機
      setTimeout(() => {
        setComments(prevComments => 
          prevComments.filter(c => c.key !== floatingComment.key)
        );
      }, (duration + 1) * 1000);

      return [...prev, floatingComment];
    });
  }, [maxDisplay, totalLanes]);

  /**
   * 初期バーストでコメントを一気に表示
   */
  const initialBurstComments = useCallback(() => {
    console.log('💥 初期バースト開始');
    const burstCount = Math.min(initialBurst, availableCommentsRef.current.length);
    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => {
        addComment();
      }, i * 100);
    }
  }, [addComment, initialBurst]);

  /**
   * 定期的なコメント追加をスケジュール
   */
  const scheduleNext = useCallback(() => {
    const delay = 500 + Math.random() * 1000;
    intervalRef.current = setTimeout(() => {
      addComment();
      scheduleNext();
    }, delay);
  }, [addComment]);

  /**
   * ホバー開始 - 依存配列を最小限に
   */
  const startHover = useCallback(async () => {
    console.log('👆 ホバー開始');
    setIsHovered(true);

    if (availableCommentsRef.current.length === 0) {
      await loadComments();
      // 状態更新が確実に反映されるまで待つ
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    if (availableCommentsRef.current.length === 0) {
      console.log('⚠️ コメントがないため表示をスキップ');
      setIsHovered(false);
      return;
    }

    setTimeout(() => {
      initialBurstComments();
      scheduleNext();
    }, 0);
  }, [loadComments, initialBurstComments, scheduleNext]);

  /**
   * ホバー終了
   */
  const endHover = useCallback(() => {
    console.log('👋 ホバー終了');
    setIsHovered(false);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
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
    };
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    setComments([]);
    const buffer = prefetchedComments ?? [];
    availableCommentsRef.current = buffer;
    setAvailableComments(buffer);
    commentCounterRef.current = 0;
  }, [gameId, prefetchedComments]);

  return {
    comments,
    isHovered,
    isLoading,
    startHover,
    endHover
  };
}
