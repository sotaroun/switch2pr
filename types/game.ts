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

/**
 * カテゴリが有効かチェックする型ガード
 */
export function isValidGameCategory(value: string): value is GameCategory {
  return ALL_GAME_CATEGORIES.includes(value as GameCategory);
}

export type GamePlatform =
  | "Nintendo Switch"
  | "PlayStation 5"
  | "PlayStation 4"
  | "Xbox Series X|S"
  | "Xbox One"
  | "PC"
  | "Steam Deck"
  | "Mobile"
  | "その他";

export const ALL_GAME_PLATFORMS: readonly GamePlatform[] = [
  "Nintendo Switch",
  "PlayStation 5",
  "PlayStation 4",
  "Xbox Series X|S",
  "Xbox One",
  "PC",
  "Steam Deck",
  "Mobile",
  "その他",
] as const;

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
  /** 概要文（オプション） */
  summary?: string;
  /** トップページに表示するか */
  visibleOnHome?: boolean;
  /** カテゴリページに表示するか */
  visibleOnCategory?: boolean;
  /** 表示名称の上書き */
  displayName?: string | null;
  /** 並び順 */
  sortOrder?: number | null;
  /** ホーム新作セクションに出すか */
  featuredNewRelease?: boolean;
  /** ホーム人気セクションに出すか */
  featuredPopular?: boolean;
  /** ホームおすすめセクションに出すか */
  featuredRecommended?: boolean;
  /** 対応プラットフォーム */
  platforms?: GamePlatform[];
  /** 初回リリース日のunix秒（ある場合） */
  firstReleaseDate?: number | null;
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
