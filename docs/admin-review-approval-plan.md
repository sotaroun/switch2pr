# 管理者承認フロー設計（初心者向け）

## ゴールと全体像
- 一言コメント（クイックレビュー）が投稿されたら管理者に通知が届く。
- 管理者が内容を確認し、承認または却下をするとサイトに反映される。
- 通知はまず Slack の指定チャンネルに送る。承認操作は Web の管理画面から行う。
- 後から余裕があれば「Slack ボタンで承認／却下」のような拡張も検討できる。

## 全体の流れ（ユーザー → 管理者）
1. ユーザーがレビュー投稿（既存フォーム）。
2. Supabase に `pending` 状態で保存。
3. Slack Webhook 経由で「新しいレビューが来ました」通知。
4. 管理者は `/admin/reviews` 画面で内容を確認し「承認 / 却下」を選ぶ。
5. 選択結果に応じて `oneliner_reviews.status` などの値を更新。
6. 承認済み (`status = approved`) のレビューがサイト上に表示される。

## ステップ別タスク

### 1. Slack 通知の準備
- **必要なもの**: Slack ワークスペース、Incoming Webhook（または Slack App）。
- Slack 側で新しい Webhook URL を発行したら、`.env.local` に以下のように保存。
  ```env
  SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxxx/xxxxx/xxxx
  SLACK_SIGNING_SECRET=xxxxxx
  ```
- Next.js で通知ユーティリティを追加。例えば `lib/slack/notifications.ts` を作り、投稿内容（ユーザー名 / 評価 / コメント / ゲームURL）を整形して Webhook に送信。
- 投稿時の Supabase insert が成功したタイミングでこのユーティリティを呼び出す。エラーになっても投稿自体が失敗しないように try/catch で握っておく。
- Slack App の「Interactivity & Shortcuts」を有効化し、リクエストURLを `https://<your-domain>/api/slack/review-action` に設定。ボタン押下時のイベントがここに届く。

### 2. 承認 API を用意する
- 実装場所
  1. **Supabase Edge Function**（本番向けに安全。サービスロールキーを使って DB を更新できる）
  - `supabase/functions/approve-oneliner-review/index.ts` を作成。
  - 環境変数 `SUPABASE_SERVICE_ROLE_KEY` を Edge Function や Next.js から利用できるように設定しておく。
  - リクエストBody例：
    ```json
    {
      "reviewId": "uuid",
      "action": "approve", // または "reject"
      "note": "却下時のメモ（任意）"
    }
    ```
  - 処理内容：
    - `action === "approve"` → `status = 'approved'`, `approved_at = now()`, `admin_note = note`
    - `action === "reject"` → `status = 'rejected'`, `approved_at = null`, `admin_note = note`
    - 結果を JSON で返す。
  - 認証：
    - Edge Function に HTTP リクエストが来たら Supabase Auth の JWT を確認。
    - `auth.getUser()` で取得したユーザーの `role` が `admin` か確認。
    - 管理画面では Supabase Auth の Email/Password や OAuth を使って `admin` ユーザーでログインしておく必要がある。

### 3. 管理画面 `/admin/reviews` を作る
- **アクセス制限**:
  - `app/admin/reviews/page.tsx` を作成。
  - 簡易的な保護として `middleware.ts` で Basic 認証（`.env` に `ADMIN_BASIC_USER` / `ADMIN_BASIC_PASS`）をかける。将来的に Supabase Auth へ置き換え可能。
- **UI 構成**:
  - `status = 'pending'` のレビュー一覧を取得。
  - 表示項目：ユーザー名、評価、コメント全文、投稿日時、対象ゲームID（またはゲーム名）、承認ボタン、却下ボタン、却下理由入力欄。
  - ボタン押下で Edge Function を `fetch` し、結果に応じてリストから該当項目を削除 or ステータス表示を更新。
  - 成功時にはトーストやバナーで反映を伝える。エラー時は理由を表示。

### 4. 通知 → 承認の流れをテスト
1. ローカル環境で `.env.local` を整えて `npm run dev`。
2. フォームからレビュー投稿 → Supabase のテーブル（`oneliner_reviews`）に `pending` で入ることを確認。
3. Slack に通知が飛ぶかチェック。こなければ Webhook URL・ネットワークエラーを確認。
4. 管理画面で承認 → Edge Function が `status=approved` に更新したかを Supabase の Table Editor で確認。
5. `ReviewSwitcherTable` が Supabase から承認済みだけを取得する実装になっていれば、承認後に画面をリロードすると表示される。

### 5. 拡張アイデア
- **Slack から直接操作**: Slack App を作り、Interactive Components を使って「承認」「却下」のボタンを押せるようにする。署名検証やレスポンスの仕組みが必要なので、基本実装が完成してから着手すると良い。
- **承認結果の通知**: 承認／却下時にも Slack へ通知を送ると、履歴が残って便利。
- **メールでの承認**: Supabase Functions と SendGrid などを組み合わせてメールベースの承認も可能。

## 参考パス・ファイル構成案
- Slack通知ユーティリティ: `lib/slack/notifications.ts`
- Edge Function: `supabase/functions/approve-oneliner-review/index.ts`
- 管理画面サーバークライアント: `lib/supabase/server-client.ts`
- 管理画面ページ: `app/admin/reviews/page.tsx`（場合によっては `components/templates/Admin/ReviewApproval.tsx` を作る）

## まとめ
- **最初のゴール**: 投稿時に Slack 通知、管理画面で承認 → Web 反映ができればOK。
- **注意したい点**: 管理者認証（誰が承認できるか）、Edge Function でのサービスキー取り扱い、Slack Webhook URL の秘匿。
- 段階的に進めることで、まず通知→Web承認を完成させ、その後余裕があれば Slack ボタン対応や承認結果の再通知などに着手。
