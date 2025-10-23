# GameOverview リファクタリング計画

## 背景
現在の `components/atoms/GameOverview.tsx` では、以下の責務が一つのファイルに混在しており可読性が低い。
1. URL パラメータから `gameId` を取得
2. IGDB API やモック API の呼び出し
3. Deepl 翻訳の処理(実装しないことになったので削除する)
4. ローディング / エラー状態の管理
5. UI の描画

レビューで指摘された通り、データ取得と UI を分離し、API 呼び出しの共通化を図る。

## やることリスト
- [ ] `OverviewData` 型の整理（必要なら `types` に切り出し）
- [ ] `lib/api/gameOverview.ts` を作成し、IGDB・モックをまとめた `getGameOverview` 関数を実装
- [ ] `lib/queries/useGameOverview.ts` を作り、`getGameOverview` を使ったカスタムフックとしてロジックをカプセル化
- [ ] `GameOverview.tsx` は UI 専用に書き換え（props で `data`, `loading`, `error` を受け取る）
- [ ] 上位コンポーネント（引用元）で `useGameOverview` から取得した値を渡す
- [ ] 動作確認と lint

## 今後の検討（TODO）
- サーバーコンポーネント化や SSR に対応する形にする
- `gameId` をページ側で取得し、UI コンポーネントから完全に分離
