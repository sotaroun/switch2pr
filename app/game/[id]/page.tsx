"use client";

import GameHeader from "@/components/molecules/GameHeader";

export default function GameDetailPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>ゲーム詳細ページ</h1>
      <p>動的ルートでゲームIDを取得します</p>

      {/* GameHeaderコンポーネント（画像 + 概要の統合） */}
      <div style={{ margin: "20px 0" }}>
        <GameHeader />
      </div>

      {/* 直接的な画像テスト */}
      <div
        style={{ margin: "20px 0", padding: "20px", border: "1px solid #ccc" }}
      >
        <h2>直接画像テスト:</h2>
        <img
          src="https://picsum.photos/300/200"
          alt="Test image"
          style={{ maxWidth: "300px" }}
          onLoad={() => console.log("Image loaded successfully")}
          onError={(e) => console.log("Image failed to load:", e)}
        />
      </div>
    </div>
  );
}
