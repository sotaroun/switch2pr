import { useState, useEffect, useRef, useCallback } from 'react';
import { InfiniteScrollResult } from '../types/comment';

interface UseInfiniteScrollOptions<T> {
  /** データ取得関数 */
  onLoadMore: (cursor: string | null) => Promise<InfiniteScrollResult<T>>;
  /** 初期データ（オプション） */
  initialData?: T[];
  /** 読み込みトリガーまでの距離（px）（デフォルト: 100） */
  threshold?: number;
  /** 機能の有効/無効（デフォルト: true） */
  enabled?: boolean;
}

interface UseInfiniteScrollReturn<T> {
  /** 現在のデータ一覧 */
  data: T[];
  /** 読み込み中かどうか */
  isLoading: boolean;
  /** エラー情報 */
  error: Error | null;
  /** まだデータがあるか */
  hasMore: boolean;
  /** 監視要素にアタッチするref */
  observerRef: (node: HTMLDivElement | null) => void;
  /** 手動で次ページを読み込む */
  loadMore: () => Promise<void>;
  /** データをリセットして初期状態に戻す */
  reset: () => void;
}

/**
 * 無限スクロール機能を提供するカスタムフック
 * Intersection Observer APIを使用して画面下部到達を検知し、自動的に次ページを読み込む
 * 
 * @template T - データの型
 * @param options - フックのオプション
 * @returns 無限スクロールの状態と制御関数
 * 
 * @example
 * ```tsx
 * const { data, isLoading, hasMore, observerRef } = useInfiniteScroll({
 *   onLoadMore: async (cursor) => {
 *     const response = await fetchComments(cursor);
 *     return {
 *       data: response.comments,
 *       nextCursor: response.pagination.nextCursor,
 *       hasMore: response.pagination.hasMore
 *     };
 *   }
 * });
 * 
 * return (
 *   <div>
 *     {data.map(item => <Item key={item.id} data={item} />)}
 *     {hasMore && <div ref={observerRef} />}
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll<T>({
  onLoadMore,
  initialData = [],
  threshold = 100,
  enabled = true
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false); // 二重読み込み防止用

  /**
   * 次ページを読み込む
   * 二重読み込みを防止し、エラーハンドリングを行う
   */
  const loadMore = useCallback(async (): Promise<void> => {
    // 二重読み込み防止チェック
    if (isLoadingRef.current || !hasMore || !enabled) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await onLoadMore(nextCursor);
      
      // データを追加
      setData(prev => [...prev, ...result.data]);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('データの読み込みに失敗しました');
      setError(errorMessage);
      console.error('無限スクロール読み込みエラー:', err);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [nextCursor, hasMore, enabled, onLoadMore]);

  /**
   * データをリセットして初期状態に戻す
   */
  const reset = useCallback(() => {
    setData(initialData);
    setNextCursor(null);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
    isLoadingRef.current = false;
  }, [initialData]);

  /**
   * Intersection Observerのセットアップ
   * 画面下部到達時に自動的にloadMoreを実行
   */
  useEffect(() => {
    if (!enabled || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        // 要素が画面に入り、かつ読み込み中でない場合のみ実行
        if (target.isIntersecting && !isLoadingRef.current) {
          loadMore();
        }
      },
      {
        // 指定したpx手前でトリガー
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    // クリーンアップ
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
      observer.disconnect();
    };
  }, [enabled, hasMore, loadMore, threshold]);

  /**
   * 監視要素にアタッチするrefコールバック
   */
  const observerRef = useCallback((node: HTMLDivElement | null) => {
    observerTarget.current = node;
  }, []);

  return {
    data,
    isLoading,
    error,
    hasMore,
    observerRef,
    loadMore,
    reset
  };
}