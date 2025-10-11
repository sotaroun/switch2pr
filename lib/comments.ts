// lib/comments.ts

import { Comment } from '../types/comment';

/**
 * ダミーコメントを生成
 */
function generateDummyComment(id: number): Comment {
  const authors = ['太郎', '花子', 'ゲーマー', 'プレイヤー', 'ユーザー'];
  const contents = [
    'このゲーム最高に面白い！',
    'グラフィックがとても綺麗です',
    'ストーリーが感動的でした',
    'やり込み要素が豊富で飽きない',
    '友達と一緒にプレイすると楽しい',
    '難易度が丁度良くて楽しめる',
    '音楽がとても良い',
    'キャラクターが魅力的',
    '操作性が良くて快適',
    '何度もプレイしたくなる'
  ];

  return {
    id: `comment-${id}`,
    author: authors[id % authors.length],
    content: contents[id % contents.length],
    createdAt: new Date(Date.now() - id * 3600000).toISOString(),
    likes: Math.floor(Math.random() * 100)
  };
}

/**
 * コメント一覧を取得するダミーAPI
 * 
 * @param gameId ゲームID
 * @param cursor カーソル
 * @param limit 取得件数
 */
export async function fetchCommentsAPI(
  gameId: string,
  cursor: string | null,
  limit: number = 50
): Promise<{ data: Comment[]; nextCursor: string | null; hasMore: boolean }> {
  // APIコールをシミュレート（500-1000msの遅延）
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

  const startIndex = cursor ? parseInt(cursor) : 0;
  const totalComments = 237; // ダミーデータの総数

  // ダミーコメントを生成
  const comments: Comment[] = [];
  for (let i = startIndex; i < Math.min(startIndex + limit, totalComments); i++) {
    comments.push(generateDummyComment(i));
  }

  const nextIndex = startIndex + limit;
  const hasMore = nextIndex < totalComments;
  const nextCursor = hasMore ? nextIndex.toString() : null;

  return {
    data: comments,
    nextCursor,
    hasMore
  };
}