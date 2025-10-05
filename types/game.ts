/**
 * ゲームの基本情報を表す型
 */
export interface Game {
  /** ゲームの一意識別子（ASIN） */
  id: string;
  /** ゲームタイトル */
  title: string;
  /** カテゴリ一覧 */
  categories: string[];
  /** ゲームアイコンのURL（オプション） */
  iconUrl?: string;
}

/**
 * 検索結果用の簡略化されたゲーム情報
 */
export interface SearchResult {
  /** ゲームID */
  id: string;
  /** ゲームタイトル */
  title: string;
}