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
  /** 投稿日時 */
  createdAt: string;
  /** いいね数（オプション） */
  likes?: number;
}

/**
 * ページネーション情報
 */
export interface PaginationInfo {
  /** 次のページのカーソル */
  nextCursor: string | null;
  /** データがまだあるか */
  hasMore: boolean;
  /** 現在のページ */
  currentPage: number;
  /** 合計件数 */
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
