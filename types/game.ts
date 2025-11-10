/**
 * ゲームカテゴリの型定義
 * BE修正時はここを更新するだけで全体に反映される
 */
export type GameCategory = 
  | 'ピンボール'
  | 'アドベンチャー'
  | 'インディー'
  | 'アーケード'
  | 'ビジュアルノベル'
  | 'カード＆ボードゲーム'
  | 'MOBA'
  | 'ポイントアンドクリック'
  | '対戦格闘'
  | 'シューター'
  | '音楽'
  | 'プラットフォーム'
  | 'パズル'
  | 'レース'
  | 'RTS'
  | 'RPG'
  | 'シミュレーター'
  | 'スポーツ'
  | 'ストラテジー'
  | 'SRPG'
  | 'タクティカル'
  | 'ハクスラ'
  | 'クイズ'
  | 'アクション'
  | 'ファンタジー'
  | 'サイエンスフィクション'
  | 'ホラー'
  | 'スリラー'
  | 'サバイバル'
  | '歴史'
  | 'ステルス'
  | 'コメディー'
  | 'ビジネス'
  | 'ドラマ'
  | 'ノンフィクション'
  | 'サンドボックス'
  | '学習'
  | 'キッズ'
  | 'オープンワールド'
  | '戦争'
  | 'パーティ'
  | '4x(開拓ストラテジー)'
  | 'エロティック'
  | 'ミステリー'
  | '恋愛';

export const ALL_GAME_CATEGORIES: readonly GameCategory[] = [
  'ピンボール',
  'アドベンチャー',
  'インディー',
  'アーケード',
  'ビジュアルノベル',
  'カード＆ボードゲーム',
  'MOBA',
  'ポイントアンドクリック',
  '対戦格闘',
  'シューター',
  '音楽',
  'プラットフォーム',
  'パズル',
  'レース',
  'RTS',
  'RPG',
  'シミュレーター',
  'スポーツ',
  'ストラテジー',
  'SRPG',
  'タクティカル',
  'ハクスラ',
  'クイズ',
  'アクション',
  'ファンタジー',
  'サイエンスフィクション',
  'ホラー',
  'スリラー',
  'サバイバル',
  '歴史',
  'ステルス',
  'コメディー',
  'ビジネス',
  'ドラマ',
  'ノンフィクション',
  'サンドボックス',
  '学習',
  'キッズ',
  'オープンワールド',
  '戦争',
  'パーティ',
  '4x(開拓ストラテジー)',
  'エロティック',
  'ミステリー',
  '恋愛'
] as const;

export function isValidGameCategory(value: string): value is GameCategory {
  return ALL_GAME_CATEGORIES.includes(value as GameCategory);
}

/**
 * 対応プラットフォームの型定義
 */
export type GamePlatform =
  | 'Nintendo Switch 2'
  | 'Nintendo Switch'
  | 'PlayStation 5'
  | 'PlayStation 4'
  | 'Xbox Series X|S'
  | 'PC(Windows)'
  | 'Mac'
  | 'Android'
  | 'iOS';

export const ALL_GAME_PLATFORMS: readonly GamePlatform[] = [
  'Nintendo Switch 2',
  'Nintendo Switch',
  'PlayStation 5',
  'PlayStation 4',
  'PC(Windows)',
  'Mac',
  'Android',
  'iOS',
] as const;

export function isValidGamePlatform(value: string): value is GamePlatform {
  return ALL_GAME_PLATFORMS.includes(value as GamePlatform);
}

/**
 * 開発・販売会社の型定義
 */
export interface GameCompany {
  name: string;
  country?: string;
}

/**
 * ゲーム情報の型定義
 */
export interface Game {
  id: string;
  title: string;
  categories: GameCategory[];
  platforms?: GamePlatform[];
  developer?: GameCompany;
  publisher?: GameCompany;
  iconUrl?: string;
  summary?: string;
  releaseDate?: string; // ISO形式
  firstReleaseDate?: number | null; // UNIX秒
  visibleOnHome?: boolean;
  visibleOnCategory?: boolean;
  displayName?: string | null;
  sortOrder?: number | null;
  featuredNewRelease?: boolean;
  featuredPopular?: boolean;
  featuredRecommended?: boolean;
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