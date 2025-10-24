import { useState, useEffect } from 'react';

/**
 * ページ読み込み状態を管理するフック
 * 
 * @returns isLoading - ページ読み込み中かどうか
 */
export function usePageLoad(): boolean {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // DOM読み込み完了チェック
    if (document.readyState === 'complete') {
      setIsLoading(false);
    } else {
      const handleLoad = () => setIsLoading(false);
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  return isLoading;
}