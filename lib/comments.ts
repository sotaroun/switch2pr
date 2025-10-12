import { Comment, InfiniteScrollResult } from '../types/comment';

/**
 * ダミーコメントを生成
 * @param id - コメントID
 * @returns 生成されたコメント
 */
function generateDummyComment(id: number): Comment {
  const authors = ['太郎', '花子', 'ゲーマー', 'プレイヤー', 'ユーザー', '冒険者', '勇者'];
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
    '何度もプレイしたくなる',
    'オンラインマルチが楽しすぎる',
    'DLCも含めて満足度が高い'
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
 * 実際のAPI実装時はこの関数を置き換える
 * 
 * @param gameId - ゲームID
 * @param cursor - ページネーションカーソル
 * @param limit - 1回の取得件数（デフォルト: 50）
 * @returns コメント一覧とページネーション情報
 * 
 * @example
 * ```typescript
 * const result = await fetchCommentsAPI('game-123', null, 50);
 * console.log(result.data); // コメント配列
 * console.log(result.hasMore); // まだデータがあるか
 * ```
 */
export async function fetchCommentsAPI(
  gameId: string,
  cursor: string | null,
  limit: number = 50
): Promise<InfiniteScrollResult<Comment>> {
  // APIコールをシミュレート（500-1000msのランダムな遅延）
  await new Promise(resolve => 
    setTimeout(resolve, 500 + Math.random() * 500)
  );

  const startIndex = cursor ? parseInt(cursor, 10) : 0;
  const totalComments = 237; // ダミーデータの総数

  // 範囲チェック
  if (startIndex < 0 || startIndex >= totalComments) {
    return {
      data: [],
      nextCursor: null,
      hasMore: false
    };
  }

  // ダミーコメントを生成
  const comments: Comment[] = [];
  const endIndex = Math.min(startIndex + limit, totalComments);
  
  for (let i = startIndex; i < endIndex; i++) {
    comments.push(generateDummyComment(i));
  }

  const nextIndex = endIndex;
  const hasMore = nextIndex < totalComments;
  const nextCursor = hasMore ? nextIndex.toString() : null;

  console.log(`[fetchCommentsAPI] gameId: ${gameId}, loaded: ${comments.length}, hasMore: ${hasMore}`);

  return {
    data: comments,
    nextCursor,
    hasMore
  };
}