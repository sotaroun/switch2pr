import { OverlayComment } from '../types/overlayComment';

/**
 * ダミーのオーバーレイコメントデータ
 */
const DUMMY_COMMENTS: Record<string, OverlayComment[]> = {
  default: [
    { id: '1', content: 'このゲーム最高！', createdAt: new Date().toISOString() },
    { id: '2', content: 'グラフィックが綺麗', createdAt: new Date().toISOString() },
    { id: '3', content: '面白すぎる', createdAt: new Date().toISOString() },
    { id: '4', content: 'ストーリーが感動的', createdAt: new Date().toISOString() },
    { id: '5', content: '神ゲー', createdAt: new Date().toISOString() },
    { id: '6', content: '友達とプレイすると楽しい', createdAt: new Date().toISOString() },
    { id: '7', content: '音楽が良い', createdAt: new Date().toISOString() },
    { id: '8', content: 'キャラが可愛い', createdAt: new Date().toISOString() },
    { id: '9', content: '操作性が快適', createdAt: new Date().toISOString() },
    { id: '10', content: '何度もプレイしたくなる', createdAt: new Date().toISOString() },
    { id: '11', content: 'やり込み要素が豊富', createdAt: new Date().toISOString() },
    { id: '12', content: '難易度がちょうどいい', createdAt: new Date().toISOString() },
    { id: '13', content: 'オンラインが楽しい', createdAt: new Date().toISOString() },
    { id: '14', content: 'DLCも最高', createdAt: new Date().toISOString() },
    { id: '15', content: '長く遊べる', createdAt: new Date().toISOString() },
    { id: '16', content: '爽快感がすごい', createdAt: new Date().toISOString() },
    { id: '17', content: '完成度高い', createdAt: new Date().toISOString() },
    { id: '18', content: '最高傑作', createdAt: new Date().toISOString() },
    { id: '19', content: '買って損はない', createdAt: new Date().toISOString() },
    { id: '20', content: '神ゲーオブザイヤー', createdAt: new Date().toISOString() },
  ]
};

/**
 * オーバーレイコメントを取得するダミーAPI
 * 
 * @param gameId - ゲームID
 * @returns オーバーレイコメント一覧
 */
export async function fetchOverlayCommentsAPI(
  gameId: string
): Promise<OverlayComment[]> {
  // APIコールをシミュレート（200msの遅延）
  await new Promise(resolve => setTimeout(resolve, 200));

  // ゲームIDに関係なくデフォルトコメントを返す
  // 実際のAPI実装時はgameIdで絞り込み
  return DUMMY_COMMENTS.default;
}