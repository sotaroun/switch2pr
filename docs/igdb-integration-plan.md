# IGDB 連携プラン（ゲーム詳細ページの基盤）

このドキュメントは、GameDetailPage に IGDB から画像・タイトル・概要を取得して表示するまでの手順をまとめたものです。段階的に進められるよう詳細なステップを列挙します。

---

## 1. 前提準備
- [ ] IGDB Developer Portal で **Client ID** と **Client Secret** を取得する。
- [ ] プロジェクトの `.env.local` に以下を追記。
  ```bash
  IGDB_CLIENT_ID=your_client_id
  IGDB_CLIENT_SECRET=your_client_secret
  ```
- [ ] すでに環境変数を読み込んでいる場合は `npm run dev` の再起動が必要。

## 2. トークン取得ユーティリティの実装
- [ ] `lib/igdb/auth.ts`（仮）を追加し、以下を実装。
  1. `requestIgdbToken()` – `https://id.twitch.tv/oauth2/token` に Client Credentials Flow で POST。
     - body: `client_id`, `client_secret`, `grant_type=client_credentials`
     - レスポンスから `access_token` と `expires_in` を取得。
  2. `getIgdbToken()` – 上記関数を使い、メモリにキャッシュして期限切れ前に再取得。
- [ ] エラーハンドリング（環境変数未設定時は warning を投げるなど）を入れておく。

## 3. ゲーム詳細 API エンドポイント
- [ ] `app/api/igdb/[id]/route.ts` を作成。
  - `GET` or `POST` でゲーム ID を受け取り、以下のリクエストを IGDB へ送る。
    ```sql
    fields id, name, summary, cover.image_id, genres.name, screenshots.image_id;
    where id = <gameId>;
    limit 1;
    ```
  - 画像 ID (`image_id`) から実際の URL を組み立てるヘルパーを作成。
    - 例: `https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg`
  - レスポンスは以下の構造を意識。
    ```ts
    type GameDetailResponse = {
      id: number;
      name: string;
      summary?: string;
      coverUrl?: string;
      genres: string[];
      screenshots: string[]; // 必要であれば
    };
    ```
  - IGDB API からデータが取得できない場合のエラーハンドリング（404 など）を準備。

## 4. フロントエンド側の取得ロジック
- [ ] `app/game/[id]/page.tsx` から、まずサーバー API (`/api/igdb/[id]`) を `fetch`。
  - `async function getGameDetail(id: string)` を定義。失敗時は null を返す。
- [ ] 取得データを `GameImage` / `GameOverview` へ渡すための整形を行う。
  - `GameImage` -> `coverUrl`
  - `GameOverview` -> `name`, `summary`, `genres`
- [ ] フロント側のローディング・エラー表示を既存のモックと同等に維持。

## 5. 現行モックとの併用
- [ ] `.env` が未設定 or IGDB エラー時のフォールバックを検討。
  - 例: IGDB 取得に失敗したら既存モック (`/api/mocks/[id]`) を参照し、少なくとも画面が表示されるようにする。
- [ ] 将来的に YouTube API 連携や他セクションにも使いやすい形でレスポンスを設計。

## 6. テスト・確認
- [ ] ローカルで `npm run dev` を起動し、IGDB から実データが取れているか確認。
  - 画像・タイトル・概要がモックでなく IGDB の情報に置き換わっているか。
  - ジャンルリストが正しく表示されるか。
- [ ] エラー時（トークン未設定等）に適切なログ / UI が出るかを確認。

## 7. 次のステップ（参考）
- YouTube API 連携用のサーバー API 実装。
- Review セクションへのデータ接続。
- IGDB の追加情報（release_dates, involved_companies など）の取得検討。

---

このプランに沿って実装を進めれば、GameDetailPage のベースとなる IGDB 連携部分を安全に構築できます。
