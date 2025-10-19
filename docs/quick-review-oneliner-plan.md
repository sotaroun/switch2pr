# クイックレビュー（一言コメント）投稿機能設計

## 0. 何を作るか
Switch2Pr にはゲームのレビューを集めて見比べる画面があります。ここに「クイックレビュー」という短いコメント欄を追加したいです。ユーザーは一言コメントと評価（星）を投稿でき、管理者が内容をチェックして問題なければ公開する仕組みを目指しています。公開されたコメントには「参考になったよ！」というサムズアップも付けられるようにします。

### 0-1. ざっくりした流れ
1. ユーザーがフォームにコメントを書いて送信する。
2. コメントはすぐには表示されず、データベース（情報を貯める場所）に「承認待ち」として保存される。
3. 管理者がチェックして OK を出すと「承認済み」に変わり、画面に出てくる。
4. 他のユーザーは、公開されたコメントにサムズアップを押せる。

### 0-2. 出てくる単語の説明
- **API**（エーピーアイ）: アプリ同士が情報をやり取りする窓口。例えば「新しいコメントを保存して」とお願いするルール。
- **GET / POST**（ゲット / ポスト）: API にお願いをするときのやり方。GET は「データをください」、POST は「データを送ります」のイメージ。
- **Supabase**（スーパーベース）: データベースと API をまとめて提供してくれるサービス。PostgreSQL（ポストグレスキューエル）というデータベースが中に入っている。
- **Supabase Auth**: Supabase のログイン・ユーザー管理機能。今回の匿名ユーザーや管理者判定に使う。
- **Supabase Edge Function**（エッジファンクション）: Supabase に置けるサーバーサイドの小さなプログラム。特別な処理だけをここに書ける。
- **PostgREST**: Supabase が自動で用意してくれる REST API。データベースのテーブルに対して GET / POST などができる。
- **RLS（Row Level Security）**: データベースの行（レコード）ごとにアクセス許可を制御する仕組み。「この人は承認済みのデータしか見られない」といったルールを設定できる。
- **Trigger（トリガー）**: データベースで「データが追加されたら自動で何かする」仕組み。今回はサムズアップを押されたら合計値を更新する。
- **Rate Limit**（レートリミット）: 短時間に連続でリクエスト（API を呼ぶこと）が来た場合に制限する仕組み。スパム投稿を防ぐ目的で使う。
- **JWT（ジェイダブリューティー）**: ユーザー情報が入ったデジタルの身分証明書。RLS で「この人は管理者か？」などをチェックするときに使う。

## 1. 目指すゴール
- ゲーム詳細ページに「クイックレビュー投稿」フォームを追加し、ユーザーが一言コメントと評価を投稿できるようにする。
- 投稿はすぐに公開されず、管理者が承認したものだけが `ReviewSwitcherTable` の「一言コメント」タブに表示される。
- コメントにはサムズアップ（参考になった）を付けることができ、その数も Supabase で管理する。

## 2. ユースケース
1. 一般ユーザーがフォームからレビューを送信する → `pending` 状態で保存、画面には案内文のみ表示。
2. 管理者が未承認リストからレビューを確認し、承認または却下を決める。
3. 承認済みレビューのみがゲーム詳細の「一言コメント」タブに表示され、閲覧ユーザーはサムズアップを付けられる。

## 3. Supabase でのデータ構造

### 3.1 テーブル: `oneliner_reviews`
| 列名 | 型 | 説明 |
| ---- | --- | ---- |
| `id` | uuid | 主キー |
| `game_id` | text | ゲーム識別子（`ReviewSwitcherTable` が参照する ID） |
| `user_name` | text | 投稿者の表示名 |
| `rating` | smallint | 星評価（1〜5）。省略可なら `nullable` |
| `comment` | text | 一言コメント。例: 最大140文字 |
| `status` | text | `pending` / `approved` / `rejected` |
| `helpful_count` | integer | サムズアップ合計。初期値0 |
| `created_at` | timestamptz | Supabase の `now()` で自動設定 |
| `updated_at` | timestamptz | 更新用トリガーで自動設定 |
| `approved_at` | timestamptz | 承認日時。未承認時は `null` |
| `admin_note` | text | 却下理由メモなど（任意） |

推奨インデックス:
- `oneliner_reviews (game_id, status, created_at DESC)` – ゲーム詳細で承認済みレビューを新しい順に取得するため。
- `oneliner_reviews (status)` – 管理画面で `pending` を一覧化する際に有効。

### 3.2 テーブル: `oneliner_review_votes`
| 列名 | 型 | 説明 |
| ---- | --- | ---- |
| `id` | uuid | 主キー |
| `review_id` | uuid | `oneliner_reviews.id` への外部キー |
| `voter_token` | text | 同一ユーザー判定用トークン（ログインなしなら localStorage などで発行） |
| `created_at` | timestamptz | 投票日時 |
| `is_active` | boolean | 解除対応したい場合に使用（初期値 true） |

`voter_token` 運用案:
1. フロント初回アクセス時に `crypto.randomUUID()` で匿名トークンを生成し、`localStorage`（例: `switch2pr_review_token`）に保存。
2. Supabase クライアントにカスタムヘッダー `x-voter-token` を付与し、`supabase.from("oneliner_review_votes").insert({ review_id, voter_token })` を呼ぶ。
3. RLS で `auth.jwt() ->> 'voter_token' = voter_token` のように照合できるよう、匿名セッションの JWT に `voter_token` を埋め込む（`supabase.auth.setSession` の `options.data` を利用）。

制約:
- `oneliner_review_votes` に `UNIQUE (review_id, voter_token)` を設定して二重投票を防ぐ。
- `helpful_count` はトリガーで `oneliner_review_votes` を元に更新するか、API 側で `INSERT` 成功時に `+1` する。クライアント直アクセス方針ではトリガー方式が堅牢。

`helpful_count` 更新用トリガー例:
```sql
create function public.sync_helpful_count() returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update oneliner_reviews
      set helpful_count = helpful_count + 1,
          updated_at = now()
      where id = new.review_id;
  elsif tg_op = 'DELETE' then
    update oneliner_reviews
      set helpful_count = greatest(helpful_count - 1, 0),
          updated_at = now()
      where id = old.review_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_sync_helpful_count
after insert or delete on public.oneliner_review_votes
for each row execute function public.sync_helpful_count();
```

## 4. API 設計
基本的に Next.js 独自 API は用意せず、クライアントから Supabase を直接呼び出す方針。RLS（Row Level Security）を設定して安全性を確保する。管理者承認だけは Supabase Edge Function を 1 本用意し、サービスロールキーで実行する。

| エンドポイント | メソッド | 概要 |
| ------------- | -------- | ---- |
| PostgREST `POST /rest/v1/oneliner_reviews` | POST | フォームから直接 Supabase を叩き、`pending` 状態で保存。RLS で挙動を制限する。 |
| PostgREST `GET /rest/v1/oneliner_reviews` | GET | `select=*` + `status=eq.approved` などのクエリで承認済みのみ取得。 |
| PostgREST `POST /rest/v1/oneliner_review_votes` | POST | サムズアップ登録。RLS で一意制約＆ `voter_token` との照合を行い、成功後にトリガーで `helpful_count` を更新。 |
| Edge Function `approve-oneliner-review` | POST | 管理者承認専用。サービスロールキーで実行し、`status` と `approved_at` を更新。呼び出し元は管理画面の Server Action 等から。 |

### 4.1 RLS ポリシー具体例
`oneliner_reviews` に対する RLS:
```sql
alter table public.oneliner_reviews enable row level security;

-- 一般閲覧: 承認済みのみ
create policy "Select approved reviews" on public.oneliner_reviews
  for select using (status = 'approved');

-- 投稿: いつでも pending で作成可能
create policy "Insert pending reviews" on public.oneliner_reviews
  for insert with check (
    status = 'pending'
    and char_length(user_name) between 1 and 40
    and char_length(comment) between 1 and 140
    and rating between 1 and 5
  );

-- 管理者のみ更新・削除
create policy "Admins can update reviews" on public.oneliner_reviews
  for update using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can delete reviews" on public.oneliner_reviews
  for delete using (auth.jwt() ->> 'role' = 'admin');
```

`oneliner_review_votes` に対する RLS:
```sql
alter table public.oneliner_review_votes enable row level security;

create policy "Insert own vote" on public.oneliner_review_votes
  for insert with check (
    auth.jwt() ->> 'voter_token' = voter_token
  );

create policy "Select own vote" on public.oneliner_review_votes
  for select using (auth.jwt() ->> 'voter_token' = voter_token);
```

匿名セッションを使う場合、サーバー側で Supabase Auth の `signInAnonymously` を実行し、取得したセッションに `role` や `voter_token` を `supabase.auth.updateUser({ data: { role: 'anon', voter_token }})` で付与する。

### 4.2 Rate Limit 方針
- Supabase Functions を使わないクライアント直アクセスでは、トリガー＋ Postgres 拡張 `pg_stat_statements` だけでは制限しづらい。`supabase` プロジェクト設定から [Function Hooks → rate limiter](https://supabase.com/docs/guides/functions/examples/rate-limiter) を利用するか、`net.http_request` + `pg_net` ベースのカスタム関数でリミット前判定を行う。
- 簡易策として、フロントエンドで `localStorage` タイムスタンプを用い、60 秒以内の二重投稿・連続投票をブロック。バックエンドでは `oneliner_reviews` に `ip_hash` 列を追加し、同一 IP からの連投をトリガーで拒否する案もある。

### 4.3 Edge Function `approve-oneliner-review` の設計
- エンドポイント例: `POST https://<project>.functions.supabase.co/approve-oneliner-review`
- リクエストボディ例:
```json
{
  "reviewId": "<uuid>",
  "action": "approve", // or "reject"
  "note": "NGワードが含まれるため却下"
}
```
- 認証: 管理画面から呼び出す際に Supabase Auth で admin ロールの JWT を取得し、`Authorization: Bearer <token>` を付与。Edge Function 側で `auth.getUser()` を呼び、`role === 'admin'` をチェック。さらに IP 制限や Basic 認証を併用すると堅牢。
- 処理フロー:
  1. `reviewId` で `oneliner_reviews` を検索。
  2. `action` が `approve` なら `status = 'approved'`, `approved_at = now()`, `admin_note = note` を更新。
  3. `action` が `reject` なら `status = 'rejected'`, `admin_note = note`, `approved_at = null` に更新。
  4. 結果を JSON で返す。

## 5. フロントエンド改修

### 5.1 投稿フォームの配置
- 対象ファイル: `components/templates/GameDetailPage/GameDetailTemplate.tsx`
- 構成例:
  - セクションタイトル「クイックレビュー投稿」
  - 入力項目: ユーザー名、評価（ラジオ or スター）、一言コメント（テキストエリア）
  - `レビュー投稿` ボタン
  - ボタン下に「※投稿されたレビューは管理者の承認後に表示されます。」という注意書き
- UI は Chakra UI で統一感が出る方を採用。
- 送信時は API を呼び、成功時にフォームを初期化しトーストで案内する。

### 5.2 テーブルへのデータ反映
- `components/organisms/ReviewSwitcherTable.tsx` の `useEffect` 内で `fetch(/api/mocks)` を呼んでいる箇所を Supabase クライアント呼び出しに置き換える。
- 取得レスポンスを `OnelinerReview` 型にマッピングし、`helpful_count` を `helpful` プロパティにセットする。
- サムズアップボタン（`HelpfulVoteButton`）のクリックイベントで Supabase の `insert` を直接実行し、成功時の `helpful_count` で UI を更新する。
- 既存の localStorage 判定は重複投票防止の UX を担うので維持する。

### 5.3 Supabase クライアントのセットアップ
- `lib/supabase/browser-client.ts` を作成し、`createBrowserSupabaseClient` で匿名セッションを扱う。`supabase.auth.getSession` → 未ログインなら `signInAnonymously` を実行し、`voter_token` を `localStorage` とユーザーデータに格納。
- サーバーコンポーネント用に `lib/supabase/server-client.ts` を用意し、`createServerClient` でクッキーからセッションを復元。管理画面ではここから admin ロールの判定を行う。
- フォーム送信・レビュー取得・サムズアップ処理はそれぞれ `browser-client` を介して実装し、Edge Function 呼び出しのみ Server Action 経由（管理者権限が必要なため）。

## 6. 管理者承認フロー
- `/admin/reviews` など簡易ページを用意（守秘要件に応じて Basic 認証や Supabase Auth ガードを設定）。
- `pending` 状態のレビューを一覧で表示し、承認/却下ボタンで Supabase Edge Function `approve-oneliner-review` を叩く。
- 承認済みは `approved_at` と `status=approved` が保存され、一般ユーザー向けクライアントからの `select` でも表示される。

## 7. テストと品質チェック
- API レベル: バリデーション（文字数・必須項目）、権限エラー、承認ステータス遷移、サムズアップ二重登録防止をユニットテスト。
- フロント E2E: 投稿 → 成功メッセージ → 管理者承認 → 一言コメントタブに表示、という流れを確認。
- セキュリティ: CSRF/XSS 対策、Rate Limit、連投スパム対策（例: 60秒に1回など）を実装。
- パフォーマンス: 表示側は `status=approved` のみ取得するため、既存表示のパフォーマンスを保てる。

## 8. 今後の拡張のヒント
- 承認通知（メール/Slack）や、承認時に自動で公開ページへ反映する Webhook を追加。
- ユーザー認証を導入して、プロフィール情報をレビューに紐付ける。
- サムズアップの取り消し、コメント編集・削除、モデレーションワークフローの強化などを段階的に検討。

## 9. Supabase 連携ステップ

### 9-1. プロジェクトを用意して環境変数を設定
1. [Supabase](https://supabase.com/) で新規プロジェクトを作成。
2. `Project Settings > API` から `Project URL` と `anon public` キーをコピー。
3. リポジトリ直下に `.env.local` を作成し、以下を貼り付ける（値は自分のものに置き換え）。
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxx
   ```
4. 既に `npm run dev` を実行している場合は一度停止し、再起動して環境変数を読み込ませる。

### 9-2. テーブルを作成
Supabase の「SQL Editor」で以下を実行。レビュー本体とサムズアップ（いいね）を保存します。
```sql
create extension if not exists pgcrypto;

create table public.oneliner_reviews (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  user_name text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 1 and 200),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  admin_note text
);

create table public.oneliner_review_votes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.oneliner_reviews(id) on delete cascade,
  voter_token text not null,
  created_at timestamptz not null default now(),
  is_active boolean not null default true
);

create index on public.oneliner_reviews (game_id, status, created_at desc);
create unique index on public.oneliner_review_votes (review_id, voter_token);
```

### 9-3. いいね数を自動更新するトリガー
```sql
create function public.sync_helpful_count() returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update oneliner_reviews
      set helpful_count = helpful_count + 1,
          updated_at = now()
      where id = new.review_id;
  elsif tg_op = 'DELETE' then
    update oneliner_reviews
      set helpful_count = greatest(helpful_count - 1, 0),
          updated_at = now()
      where id = old.review_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_sync_helpful_count
  after insert or delete on public.oneliner_review_votes
  for each row execute function public.sync_helpful_count();
```

### 9-4. Row Level Security を有効化
```sql
alter table public.oneliner_reviews enable row level security;
alter table public.oneliner_review_votes enable row level security;

-- 承認済みレビューだけ閲覧できる
create policy "Select approved reviews" on public.oneliner_reviews
  for select using (status = 'approved');

-- 投稿は常に pending で、入力値の長さなどをチェック
create policy "Insert pending reviews" on public.oneliner_reviews
  for insert with check (
    status = 'pending'
    and char_length(user_name) between 1 and 40
    and char_length(comment) between 1 and 200
    and rating between 1 and 5
  );

-- いいね投票は自分の voter_token のみ Insert/Select 可
create policy "Insert own vote" on public.oneliner_review_votes
  for insert with check (auth.jwt() ->> 'voter_token' = voter_token);

create policy "Select own vote" on public.oneliner_review_votes
  for select using (auth.jwt() ->> 'voter_token' = voter_token);
```

### 9-5. 匿名ログインを有効化
ダッシュボードの `Authentication > Providers` で `Anonymous` を ON にする。これでフロントから匿名サインインが可能になる。

### 9-6. フロント側でやること
- `lib/supabase/browser-client.ts` が `ensureAnonReviewSession` を通じて匿名サインイン＆ `voter_token` 保管を担当。
- `components/organisms/QuickReviewForm.tsx` は Supabase に直接 `insert` してレビューを `pending` 状態で保存する。
- 今後は `ReviewSwitcherTable` のデータ取得部分を `fetch(/api/mocks)` から Supabase クエリに書き換えれば、承認済みレビューが表示される。

### 9-7. 動作確認
1. `.env.local` を設定した状態で `npm run dev` を起動。
2. `/game/[id]` ページの「クイックレビュー投稿」が入力できるか確認。
3. 投稿後、Supabase の `Table Editor` で `oneliner_reviews` に `pending` レコードが作成されていれば成功。

### 9-8. 管理者承認をどう実装するか
- サービスロールキー（`service_role`）は **クライアントで使わない**。Supabase Edge Function や Next.js Route Handler などサーバー側で保持し、承認処理用の API を用意する。
- 管理画面から承認ボタンを押す → Edge Function を呼び出し → `status` を `approved`、`approved_at` を `now()` に更新。  
  その際、Supabase Auth で `role = admin` かどうかチェックしておくと安全。


