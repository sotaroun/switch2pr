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
  /** 初期表示件数 */
  initialBurst?: number;
}

interface UseOverlayCommentsReturn {
  /** 表示中のコメント */
  comments: FloatingComment[];
  /** ホバー状態 */
  isHovered: boolean;
  /** コメント読み込み中 */
  isLoading: boolean;
  /** ホバー開始 */
  startHover: () => void;
  /** ホバー終了 */
  endHover: () => void;
}

/**
 * 文字数に応じたアニメーション時間を計算
 */
function calculateDuration(length: number): number {
  if (length <= 10) return 12;
  if (length <= 20) return 18;
  if (length <= 30) return 24;
  return 30;
}

/**
 * ランダムなフォントサイズを取得（将来的にgoodCountベースに変更）
 */
function getRandomFontSize(): number {
  const sizes = [14, 16, 18, 20, 24, 28];
  return sizes[Math.floor(Math.random() * sizes.length)];
}

/**
 * ランダムなレーンを取得（重複を避ける）
 */
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

/**
 * オーバーレイコメント機能を提供するカスタムフック
 */
export function useOverlayComments({
  gameId,
  fetchComments,
  maxDisplay = 20,
  totalLanes = 20,
  initialBurst = 10
}: UseOverlayCommentsOptions): UseOverlayCommentsReturn {
  const [comments, setComments] = useState<FloatingComment[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableComments, setAvailableComments] = useState<OverlayComment[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const commentCounterRef = useRef(0);

  /**
   * コメントをフェッチ
   */
  useEffect(() => {
    if (gameId && isHovered) {
      setIsLoading(true);
      console.log('🔄 コメント読み込み開始');
      fetchComments(gameId)
        .then(comments => {
          setAvailableComments(comments);
          setIsLoading(false);
          console.log('✅ コメント読み込み完了:', comments.length);
        })
        .catch(() => {
          setIsLoading(false);
          console.log('❌ コメント読み込み失敗');
        });
    }
  }, [gameId, isHovered, fetchComments]);

  /**
   * コメントを追加
   */
  const addComment = useCallback(() => {

      console.log('📝 addComment呼び出し:', {
    availableCommentsCount: availableComments.length,
    currentCommentsCount: comments.length,
    maxDisplay
  });

    if (availableComments.length === 0) {
        console.warn('⚠️ コメントがありません');
        return;
    }
    if (comments.length >= maxDisplay) {
    console.warn('⚠️ [addComment] 最大表示数に達しています');
    return;
  }

    const randomComment = availableComments[
      Math.floor(Math.random() * availableComments.length)
    ];

    console.log('✨ [addComment] コメント追加実行');

    const usedLanes = new Set(comments.map(c => c.lane));
    const lane = getRandomLane(usedLanes, totalLanes);
    const duration = calculateDuration(randomComment.content.length);
    const fontSize = getRandomFontSize();

    const floatingComment: FloatingComment = {
      ...randomComment,
      lane,
      duration,
      fontSize,
      key: `${randomComment.id}-${commentCounterRef.current++}`
    };

    setComments(prev => [...prev, floatingComment]);

    // アニメーション完全終了まで待機（画面左端通過まで）
    // 文字幅を考慮して少し余裕を持たせる
    setTimeout(() => {
      setComments(prev => prev.filter(c => c.key !== floatingComment.key));
    }, (duration + 1) * 1000); // +1秒余裕を持たせる
  }, [availableComments, comments, maxDisplay, totalLanes]);

  /**
   * 初期バーストでコメントを一気に表示
   */
  const initialBurstComments = useCallback(() => {
    for (let i = 0; i < initialBurst; i++) {
      setTimeout(() => {
        addComment();
      }, i * 100); // 100msずつずらして表示
    }
  }, [addComment, initialBurst]);

  /**
   * ホバー開始
   */
  const startHover = useCallback(() => {
  console.log('👆 [startHover] ホバー開始');
  setIsHovered(true);
    
  // 即座に初期バースト開始
  initialBurstComments();

    // 定期的にコメントを追加
    const scheduleNext = () => {
      const delay = 500 + Math.random() * 1000;
      intervalRef.current = setTimeout(() => {
        addComment();
        scheduleNext();
      }, delay);
    };

  // 初期バースト後すぐに定期追加開始
  setTimeout(() => {
    scheduleNext();
  }, 500);
    
  }, [addComment, initialBurstComments, initialBurst]);

  /**
   * ホバー終了
   * 表示中のコメントを即座に削除
   */
  const endHover = useCallback(() => {
    setIsHovered(false);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    // 表示中のコメントを即座に削除
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

  return {
    comments,
    isHovered,
    isLoading,
    startHover,
    endHover
  };
}
