# YouTube API 連携プラン（ゲーム詳細ページのレビュー）

GameDetailPage のレビューセクションで YouTube 動画を実データ化するための手順です。IGDB 連携と同じように段階を踏んで構築します。

---

## 1. 前提準備
- [ ] Google Cloud Console でプロジェクトを作成（または既存プロジェクトを使用）。
- [ ] YouTube Data API v3 を有効化。
- [ ] API キーを作成し、`.env.local` に追加。
  ```bash
  YOUTUBE_API_KEY=your_api_key
  ```

## 2. API 設計
- 必要な情報: 動画 ID、タイトル、説明、サムネイル、チャンネル名、公開日、再生回数など。
- 取得手順の基本パターン：
  1. `search` メソッドでゲームタイトルキーワードに一致する動画 ID を取得。
  2. `videos` メソッドで詳細情報（statistics, snippet）をまとめて取得。
- リクエスト例：
  ```http
  GET https://www.googleapis.com/youtube/v3/search
    ?part=snippet
    &q=<ゲーム名+レビュー等のキーワード>
    &type=video
    &maxResults=10
    &key=API_KEY
  ```
  取得した videoId を使って：
  ```http
  GET https://www.googleapis.com/youtube/v3/videos
    ?part=snippet,statistics,contentDetails
    &id=<comma-separated videoIds>
    &key=API_KEY
  ```

## 3. サーバー API の実装
- `app/api/youtube/reviews/route.ts` を作成。
  - クエリパラメータ: `?query=<検索語>` または `?gameId=<IGDBのID>` を受け取る設計を検討。
  - `YOUTUBE_API_KEY` を使って上記 2 ステップのリクエストを行い、必要なフィールドだけを整形して返す。
  - レスポンス例：
    ```ts
    type YoutubeReview = {
      videoId: string;
      title: string;
      description: string;
      channelTitle: string;
      publishedAt: string;
      thumbnailUrl: string;
      viewCount?: number;
      likeCount?: number;
    };
    ```
- API キー漏洩を避けるため、クライアントからはサーバー API だけを呼ぶようにする。

## 4. ReviewSwitcherTable 側の改修
- 既存の `ReviewSwitcherTable` はモックデータを表示しているため、YouTube ソースのデータを API から受け取れるように修正。
  - 現状の columns 定義は再利用できるため、`useEffect` で `/api/youtube/reviews?query=<ゲーム名>` を呼んで `reviews.youtube` を入れ替える形を検討。
  - query のゲーム名は IGDB の `name` から借りるか、GameOverview に渡す際に保持しておく。

## 5. レート制限・キャッシュ
- 無料枠では 1 日あたりのクォータがあるため、API 呼び出し回数に注意。
  - キャッシュ案: サーバー側で `query` をキーに一定時間（例: 1 時間）メモリ／KV に保存。
  - `maxResults` を絞る（初期表示は 5～10 件程度）。

## 6. エラー・フォールバック対応
- YouTube API のレスポンスエラー時はモックデータまたは空表示を返す。
- `YOUTUBE_API_KEY` が未設定の場合、API 経由で警告を返却（`status: 500` や `error: "missing_api_key"` など）。

## 7. テスト・確認
- `.env.local` にキーを設定した状態で `npm run dev` を起動。
- `http://localhost:3000/api/youtube/reviews?query=<ゲーム名>` で JSON が返るか確認。
- ReviewSwitcherTable で YouTube タブを開き、動画が整形されて表示されるか UI レベルで確認。
- `npm run lint` を実行。

## 8. 今後の拡張
- ゲーム ID と YouTube の関連をより厳密にしたい場合、IGDB の別名やジャンルを組み合わせて検索クエリを組む。
- 参考数・コメント数など他ソース（ex: YouTube コメント）との同期を検討。
- YouTube API の quota が不足する場合は、APIs を分散 / キャッシュ層（ISR, Redis など）を導入。
