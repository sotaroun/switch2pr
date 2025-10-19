# PR: GameDetailPage 進捗（Supabase連携 & 管理者承認フロー）

## 概要
ゲーム詳細ページ（GameDetailPage）の実装を進めつつ、一言レビュー機能を Supabase 連携仕様へ移行し、管理者承認フローの設計ドキュメントを追加しました。

## What
- Quickレビュー投稿フォームを本番想定の UI／Supabase 直結版に差し替え。
- レビュー表示テーブルを Supabase (oneliner_reviews / oneliner_review_votes) 連携へ切り替え。
- 管理者承認＋Slack 通知の計画ドキュメント（`docs/admin-review-approval-plan.md`）を追加。
- Supabase セットアップ手順を `docs/quick-review-oneliner-plan.md` に追記。

本 PR は引き続きトラッキング用途のため Draft のまま保持します。

## 実装済みコンポーネント / 機能
### ✅ Atom / Molecule / Organism
- GameImage / GameOverview / GameReviews 基盤（完了）
- ReviewSwitcherTable（YouTube／一言コメント切替、テーブル描画）
- QuickReviewForm（Supabase 投稿・スター評価・sticky レイアウト）

### ✅ Supabase 連携
- `oneliner_reviews` と `oneliner_review_votes` を利用して承認済みレビュー＆参考投票を表示。
- 匿名セッション (`signInAnonymously`) で投稿・投票を実現。
- 一言レビューの取得・Helpful 投票を Supabase クエリへ置き換え。

### ✅ ドキュメント
- `docs/quick-review-oneliner-plan.md`：Supabase setup（環境変数、テーブル作成、RLS設定など）を追記。
- `docs/admin-review-approval-plan.md`：Slack 通知＋管理者承認フローの設計を追加。

## 現在の進捗まとめ
- GameImage / GameOverview コンポーネント：完了（動的ルート、モックデータ連携）。
- ReviewSwitcherTable：Supabase 連携へ移行、Helpful 投票も対応。
- QuickReviewForm：Supabase 投稿対応の新UIへ置き換え。
- ドキュメント：Supabase 連携手順と承認フロー設計を整理。

## 今後の実装予定
- 管理者承認 API（Supabase Edge Function）実装。
- `/admin/reviews` 管理画面の作成と管理者認証の導線整備。
- Slack Webhook 通知の実装（投稿時／承認時）、必要なら Slack ボタン操作の検討。
- YouTube セクションや全体レイアウトの微調整。
- 実際の IGDB API との接続仕上げ。
- エラーハンドリング・ログ整備。

## 関連PR
- [x] #64
- [x] #65
- [x] #69
- [x] #70
- [x] #72
- [x] #73

## 技術詳細
- Next.js 13+ App Router
- Chakra UI
- TypeScript
- Supabase (`@supabase/supabase-js`)
- 動的ルーティング（`app/game/[id]/page.tsx`）
