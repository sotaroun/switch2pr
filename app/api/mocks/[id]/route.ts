import { NextResponse } from "next/server";
import data from "@/app/(mocks)/data/game-overview.json";

type GameReviews = {
  youtube?: Array<{ user: string; comment: string; title: string; channel: string }>;
  oneliner?: Array<{
    user: string;
    comment: string;
    rating: number;
    postedAt?: string;
    helpful?: number;
    status?: string;
  }>;
};

// ゲーム概要データの型定義
type GameOverview = {
  id: number;
  name: string;
  summaryJa?: string | null; // 日本語の概要（オプション）
  summaryEn?: string | null; // 英語の概要（オプション）
  genres?: string[]; // ジャンル一覧（オプション）
  reviews?: GameReviews; // 口コミモック
};

// GET /api/mocks/[id] - ゲームIDに基づいてゲーム概要データを返すAPI
export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;

  // JSONファイルから指定されたIDのゲームデータを取得
  const record = (data as Record<string, GameOverview | undefined>)[id];

  // データが見つからない場合は404エラーを返す
  if (!record) {return NextResponse.json({ error: "not found" }, { status: 404 });}

  // 見つかったゲームデータをJSONで返す（60秒キャッシュ付き）
  return NextResponse.json(record, {
    headers: {
      // モックデータなので短時間のキャッシュを設定
      "Cache-Control": "public, max-age=60",
    },
  });
}
