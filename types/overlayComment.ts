/**
 * オーバーレイコメントの型定義
 */
export interface OverlayComment {
  /** コメントID */
  id: string;
  /** コメント内容 */
  content: string;
  /** 作成日時 */
  createdAt: string;
}

/**
 * コメント表示用の内部状態
 */
export interface FloatingComment extends OverlayComment {
  /** 表示レーン（0-19） */
  lane: number;
  /** アニメーション時間（秒） */
  duration: number;
  /** 一意のキー */
  key: string;
}