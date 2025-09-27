import { NextResponse } from "next/server";
import data from "@/app/(mocks)/data/game-overview.json";

// ゲーム概要データの型定義
type GameOverview = {
  id: number;
  name: string;
  summaryJa?: string | null; // 日本語の概要（オプション）
  summaryEn?: string | null; // 英語の概要（オプション）
  genres?: string[]; // ジャンル一覧（オプション）
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
