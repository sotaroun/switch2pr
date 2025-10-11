# YouTube API 連携プラン（ゲームレビュー用コメント取得）

ゲーム詳細ページの YouTube タブで、ゲームに対するコメントを実データ化するための計画です。公式動画を優先しつつ、コメント欄が閉じられているケースにも対応する構成を想定しています。

---

## 1. 前提準備
- Google Cloud Console でプロジェクトを作成（または既存プロジェクトを使用）。
- YouTube Data API v3 を有効化。
- API キーを発行し、`.env.local` に設定。
  ```bash
  YOUTUBE_API_KEY=your_api_key
  ```
- 開発サーバーを再起動して環境変数を読み込ませる。

---

## 2. 取得方針
1. **動画候補の検索**
   - `search.list` (`part=snippet`) でゲーム名 + 公式系キーワード（例: `公式`, `official`）を含む日本語の動画を検索。
   - パラメータ例: `q=<ゲーム名> 公式`, `regionCode=JP`, `relevanceLanguage=ja`, `type=video`, `maxResults=10`。
   - 結果を「公式らしさ」でスコアリング（チャンネル名 / タイトルに `公式`, `official` が含まれるか、既知の公式チャンネル ID に一致するか等）。
2. **準公式動画の考慮**
   - 公式候補のコメントが取得できなかった場合、同じ検索結果から日本語のレビュー動画（公式でなくとも信頼できそうなチャンネル）を追加候補とする。
   - フィルタ条件例: チャンネル名・タイトルに `レビュー`, `感想`, `解説`, `日本語` などが含まれるもの。
3. **コメント取得**
   - 優先度の高い動画から順に `commentThreads.list` (`part=snippet`, `textFormat=plainText`, `order=relevance`) を呼び、トップレベルコメントを収集。
   - 動画あたりの取得数と全体の最大数を決め、Quota を超えないよう注意。

---

## 3. サーバー API 設計
- `app/api/youtube/reviews/route.ts`
  - クエリ: `?query=<ゲーム名>`
  - 処理フロー:
    1. 検索 API で候補動画を取得し、公式度・準公式度で並び替え。
    2. 上位からコメントを収集 (`commentThreads.list`) し、十分な数が集まったら終了。
    3. コメントは以下の形式に整形：
       ```ts
       type YoutubeGameComment = {
         videoId: string;
         videoTitle: string;
         channelTitle: string;
         channelId: string;
         comment: string;
         author: string;
         publishedAt: string;
         likeCount?: number;
         url: string; // コメントまたは動画へのリンク
         isOfficialLike: boolean;
       };
       ```
    4. エラー時は HTTP 500 + `error` フィールドで理由を返す。

---

## 4. フロントエンド統合
- `ReviewSwitcherTable` の YouTube タブは、コメント単位のリストを表示するように変更。
  - 列案: コメント本文 / 投稿者 / 動画タイトル (リンク) / チャンネル名 / 公開日 / いいね数。
  - コメント本文が長い場合は適度に省略し、ホバーで全体表示するなどの UI を検討。
- API 取得時、IGDB から得たゲーム名を検索語として渡す。
- API キー未設定 or 取得失敗時は、明示的にメッセージを表示しモックにフォールバック。

---

## 5. Quota・キャッシュ戦略
- `commentThreads.list` のクォータ消費は `cost=1` だが動画数が多いと総コストが上がるため、
  - 公式候補 3 本 + 準公式 2 本など、探索数を制限。
  - API 結果をサーバー側で短時間キャッシュ（例: 1 時間）して、同じゲーム名への再問い合わせを抑える。
- 大量のコメントを取得する必要はないため、1 動画あたり 3～5 件、全体で 15 件程度を目安とする。

---

## 6. テスト・確認
- `.env.local` に API キーを設定 → `npm run dev`。
- `http://localhost:3000/api/youtube/reviews?query=<ゲーム名>` を叩き、コメント付きの JSON が返ることを確認。
- 詳細ページで YouTube タブを開き、コメントが表示されること、公式系の動画が優先されていることを確認。
- `npm run lint` を実行。

---

## 7. 今後の改善アイデア
- 公式チャンネル ID のホワイトリストを持ち、判定精度を高める。
- コメントの内容分類（ポジティブ / ネガティブなど）の導入。
- 翻訳 API（DeepL など）と組み合わせ、日本語以外のコメントにも対応。
- キャッシュ層（Redis / レスポンス保存）を導入してクォータ消費をさらに抑える。
