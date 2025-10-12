/**
 * コメントの基本情報を表す型
 */
export interface Comment {
  /** コメントの一意識別子 */
  id: string;
  /** 投稿者名 */
  author: string;
  /** コメント内容 */
  content: string;
  /** 投稿日時（ISO 8601形式） */
  createdAt: string;
  /** いいね数（オプション） */
  likes?: number;
}

/**
 * ページネーション情報を表す型
 */
export interface PaginationInfo {
  /** 次のページのカーソル（nullの場合は最後のページ） */
  nextCursor: string | null;
  /** さらにデータが存在するか */
  hasMore: boolean;
  /** 現在のページ番号 */
  currentPage: number;
  /** データの合計件数 */
  totalCount: number;
}

/**
 * コメント取得APIのレスポンス型
 */
export interface CommentResponse {
  /** コメント一覧 */
  comments: Comment[];
  /** ページネーション情報 */
  pagination: PaginationInfo;
}

/**
 * 無限スクロール用のデータ取得結果型
 */
export interface InfiniteScrollResult<T> {
  /** 取得したデータ */
  data: T[];
  /** 次のカーソル */
  nextCursor: string | null;
  /** さらにデータがあるか */
  hasMore: boolean;
}
