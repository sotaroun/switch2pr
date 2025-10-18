/**
 * ゲームカテゴリの型定義
 * BE修正時はここを更新するだけで全体に反映される
 */
export type GameCategory = 
  | 'アクション' 
  | 'RPG' 
  | 'シューティング' 
  | 'スポーツ' 
  | 'パズル';

/**
 * 利用可能な全カテゴリの配列
 * UI表示やバリデーションに使用
 */
export const ALL_GAME_CATEGORIES: readonly GameCategory[] = [
  'アクション',
  'RPG',
  'シューティング',
  'スポーツ',
  'パズル'
] as const;

/**
 * カテゴリが有効かチェックする型ガード
 */
export function isValidGameCategory(value: string): value is GameCategory {
  return ALL_GAME_CATEGORIES.includes(value as GameCategory);
}

/**
 * ゲームの基本情報を表す型
 */
export interface Game {
  /** ゲームの一意識別子（ASIN） */
  id: string;
  /** ゲームタイトル */
  title: string;
  /** カテゴリ一覧（厳密な型定義） */
  categories: GameCategory[];
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