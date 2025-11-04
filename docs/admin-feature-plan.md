# 掲載ゲーム管理機能 計画書

## ゴール
- 運営が「トップページ」や「カテゴリページ」に載せるゲームをブラウザ上で切り替えられるようにする。
- 表示名や掲載順も調整できるようにし、IGDB 連携の自動取得データを上書きできるようにする。

## 背景
- 現状 `/api/games` は IGDB から人気タイトルを抽出しており、掲載ゲームを運営が制御できない。
- 新作特集などで掲載するタイトルを素早く切り替えたいニーズがある。

## 要求事項
1. Supabase に `featured_games` テーブル（例: `igdb_id`, `display_name`, `visible_on_home`, `visible_on_category`, `sort_order`）を用意。
2. `/api/games` は `featured_games` に登録があればそのゲームのみを返し、なければ従来の人気ゲーム fallback にする。
3. 管理画面 `/admin/games` を追加し、以下の操作ができるようにする。
   - IGDB ID を入力してゲームを登録
   - 表示名（任意）を編集
   - "ホーム" / "カテゴリ" 掲載の ON/OFF 切り替え
   - 並び順の設定
   - 掲載からの削除
4. 管理画面からの操作を処理する API (`/api/admin/games`) を実装（GET/POST）。
5. トップページ／カテゴリページは `visibleOnHome`, `visibleOnCategory` を見て表示を切り替える。

## タスクブレイクダウン
1. Supabase テーブル設計・マイグレーションの確認
2. `/api/games` を `featured_games` 対応にリファクタリング
3. 管理画面 `/admin/games` の UI 実装（一覧 + 追加フォーム + トグル）
4. 管理用 API (`GET` で一覧, `POST` で upsert/remove) の実装
5. トップページ／カテゴリページでの表示ロジック更新
6. 動作確認 + lint

## 注意事項
- API は Basic 認証済みの管理者ページでのみ呼ばれる想定。必要なら認証導入を検討。
- IGDB ID は数値／ユニークで扱う。入力時はバリデーションを行う。
- Fallback で取得した人気ゲームを Supabase に登録する機能は今回は scope 外。

## 次のステップ
1. 新ブランチ `feature/admin-game-management` を切る
2. `/api/games` を featured 対応に更新
3. `/api/admin/games` と `/admin/games`（管理 UI）を実装
4. 各ページの表示条件を `visibleOnHome` / `visibleOnCategory` を見るよう調整
