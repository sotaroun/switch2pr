"use client";

import GameHeader from "@/components/molecules/GameHeader";
import ReviewSwitcher from "@/components/organisms/ReviewSwitcherTable";

export default function GameDetailPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>ゲーム詳細ページ</h1>
      <p>動的ルートでゲームIDを取得します</p>

      {/* GameHeaderコンポーネント（画像 + 概要の統合） */}
      <div style={{ margin: "20px 0" }}>
        <GameHeader />
        <ReviewSwitcher/>
      </div>
    </div>
  );
}
