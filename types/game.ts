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

/**
 * 対応ハードウェアの型定義
 * （IGDBの platforms.name を参照）
 */
export type GamePlatform =
  | 'Nintendo Switch 2' 
  | 'PlayStation 5'
  | 'Mac'
  | 'Nintendo Switch'
  | 'Android'
  | 'PC(Windows)'
  | 'Xbox Series X/S'
  | 'Xbox One'
  | 'New Nintenendo 3DS'
  | 'Nintendo 3DS'
  | 'PlayStation 4'
  | 'PlayStation Vita'
  | 'Wii'
  | 'Wii U'
  | 'Playstation 3'
  | 'Playstation Portable'
  | 'xbox 360'
  | 'Nintendo DSi'
  | 'Nintendo DS'
  | 'Mac'
  | 'iOS'
  |'Game Boy Advance'
  |'Nintendo 64'
  |'WonderSwan'
  |'WonderSwan Color'
  |'Nintendo GameCube'
  |'Playstation'
  |'Dreamcast'
  |'Game Boy Color'
  |'Game Boy'
  |'Super Famicom'
  |'Nintendo Entertainment System'
  | 'その他';
  
export const ALL_GAME_PLATFORMS: readonly GamePlatform[] = [
  'Nintendo Switch 2',
  'PlayStation 5',
  'Mac',
  'Nintendo Switch',
  'Android',
  'PC(Windows)',
  'Xbox Series X/S',
  'Xbox One',
  'New Nintenendo 3DS',
  'Nintendo 3DS',
  'PlayStation 4',
  'PlayStation Vita',
  'Wii',
  'Wii U',
  'Playstation 3',
  'Playstation Portable',
  'xbox 360',
  'Nintendo DSi',
  'Nintendo DS',
  'iOS',
  'Game Boy Advance',
  'Nintendo 64',
  'WonderSwan',
  'WonderSwan Color',
  'Nintendo GameCube',
  'Playstation',
  'Dreamcast',
  'Game Boy Color',
  'Game Boy',
  'Super Famicom',
  'Nintendo Entertainment System',
  'その他'
] as const;

/**
 * プラットフォームが有効かチェックする型ガード
 */
export function isValidGamePlatform(value: string): value is GamePlatform {
  return ALL_GAME_PLATFORMS.includes(value as GamePlatform);
}

/**
 * 開発・販売会社の型定義
 * IGDBの "involved_companies" 情報に対応
 */
export interface GameCompany {
  name: string;
  country?: string; // 任意で国情報も取得可能
}

/**
 * ゲームの基本情報を表す型
 */
export interface Game {
  /** ゲームの一意識別子（ASINまたはIGDB ID） */
  id: string;
  /** ゲームタイトル */
  title: string;
  /** カテゴリ一覧（厳密な型定義） */
  categories: GameCategory[];
  /** 対応プラットフォーム */
  platforms?: GamePlatform[];
  /** デベロッパー */
  developer?: GameCompany;
  /** パブリッシャー */
  publisher?: GameCompany;
  /** ゲームアイコンのURL（オプション） */
  iconUrl?: string;
  /** 概要文（オプション） */
  summary?: string;
}

/**
 * 検索結果用の簡略化されたゲーム情報
 */
export interface SearchResult {
  id: string;
  title: string;
}

export interface Game {
  /** ゲームの一意識別子（ASINまたはIGDB ID） */
  id: string;
  /** ゲームタイトル */
  title: string;
  /** カテゴリ一覧（厳密な型定義） */
  categories: GameCategory[];
  /** 対応プラットフォーム */
  platforms?: GamePlatform[];
  /** デベロッパー */
  developer?: GameCompany;
  /** パブリッシャー */
  publisher?: GameCompany;
  /** ゲームアイコンのURL（オプション） */
  iconUrl?: string;
  /** 概要文（オプション） */
  summary?: string;
  /** 発売日（ISO 8601形式） */
  releaseDate?: string;
}