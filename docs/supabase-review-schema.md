# Supabase のテーブル・ポリシー設計まとめ（初心者向け）

このドキュメントでは、一言コメント機能で使っている Supabase のテーブルと設定を「何を意図しているか」「なぜ必要か」を初心者向けに解説します。調査や再設定が必要になったときに、ここを見れば最小限のステップで整えられます。

## 1. テーブル構成

### 1.1 `oneliner_reviews`
ユーザーが投稿した一言コメントを保存します。

| 列名 | 型 | 説明 |
| ---- | --- | ---- |
| `id` | uuid | 主キー。`crypto.randomUUID()` で生成します |
| `game_id` | text | どのゲームに紐づくコメントか |
| `user_name` | text | 投稿者の表示名 |
| `rating` | smallint | 星評価（1〜5） |
| `comment` | text | コメント本文（200文字以内） |
| `status` | text | `pending` / `approved` / `rejected` |
| `helpful_count` | integer | 「参考になった」の合計 |
| `created_at` | timestamptz | 投稿日時（自動） |
| `updated_at` | timestamptz | 更新日時（自動） |
| `approved_at` | timestamptz | 承認日時（承認時のみセット） |
| `admin_note` | text | 却下理由などのメモ |

補足:
- **初期状態**では `status = 'pending'`。管理者が承認すると `approved` になります。
- `helpful_count` はリアルタイムに更新するため、後述のトリガーで自動更新します。

### 1.2 `oneliner_review_votes`
「参考になった（サムズアップ）」を保存します。

| 列名 | 型 | 説明 |
| ---- | --- | ---- |
| `id` | uuid | 主キー |
| `review_id` | uuid | `oneliner_reviews.id` への外部キー（`on delete cascade`） |
| `voter_token` | text | 「誰が投票したか」を識別するトークン（フロントで匿名セッションごとに発行） |
| `created_at` | timestamptz | 投票日時 |
| `is_active` | boolean | 取り消し機能をつけたいとき用（現状 true 固定） |

補足:
- `review_id` と `voter_token` の組み合わせにユニーク制約を付けて二重投票を防止しています。

## 2. Helpful 集計の仕組み

ユーザーが再読み込みしても投票数が正しく表示されるよう、DB 側で `helpful_count` を更新します。以下のトリガーを設定しておきます。

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

これにより、投票と連動して `oneliner_reviews.helpful_count` が増減します。フロント側では即時表示用に状態を更新しつつ、最終的な整合性は DB が担保します。

## 3. RLS（Row Level Security）設定

Supabase では RLS を有効にすることで、テーブルごとに「誰がどの操作を許可されているか」を決められます。設定がないと 403 エラーになります。ここでは匿名セッション (`signInAnonymously`) を使うことを前提に、`auth.role()` で判定しています。

### 3.1 一言コメント (`oneliner_reviews`)
```sql
alter table public.oneliner_reviews enable row level security;

create policy "Select approved reviews" on public.oneliner_reviews
  for select using (status = 'approved');

create policy "Insert pending reviews" on public.oneliner_reviews
  for insert with check (
    status = 'pending'
    and char_length(user_name) between 1 and 40
    and char_length(comment) between 1 and 200
    and rating between 1 and 5
  );

-- 管理者による承認・却下はサービスロールキーで Edge Function を経由して行います。
```

### 3.2 Helpful 投票 (`oneliner_review_votes`)
```sql
alter table public.oneliner_review_votes enable row level security;

create policy "Insert vote" on public.oneliner_review_votes
  for insert with check (auth.role() = 'authenticated');

create policy "Select vote" on public.oneliner_review_votes
  for select using (auth.role() = 'authenticated');
```

ここでポイントは、匿名セッションでも Supabase が `role = 'authenticated'` として扱ってくれることです（`signInAnonymously` 成功時）。そのため、`auth.role() = 'authenticated'` という条件で投票を許可しています。以前のように `auth.jwt() ->> 'voter_token'` を直接チェックすると、匿名 JWT にはカスタムクレームが含まれないため常に `null` になり、403 が出てしまいます。

## 4. 投票を一度だけにする仕組み

- **データベース側** … `review_id` と `voter_token` のユニーク制約で二重投票を排除します。フロントから同じ組み合わせを投げても `23505`（一意制約違反）で失敗します。
- **フロント側** … localStorage に投票済みレビューのキーを保存し、ボタン表示時に `isDisabled` として扱います。DB とブラウザの両方でガードする二重の安全策です。

フロントで使っているキーは `buildHelpfulStorageKey(gameId, review)` で作っており、DB から返ってきた `review.id` があればそれを優先します。そうすることで、コメント内容が変わっても同じレビューとして認識できます。

## 5. ソート機能の方針（参考）

レビュータブには複数の並び順があり、フロント側の状態で制御しています。
- YouTube 口コミ: `published_at` 降順（新着順）、`likeCount` 降順（高評価順）。
- 一言コメント: `postedAt` 降順（新着順）、`rating` 降順（評価順）、`helpful` 降順（参考になった順）。

`ReviewSwitcherTable` で `sortKeys` ステートを持ち、ユーザーがタブをクリックするとローカルで配列を並び替えて描画しています。必要に応じて Supabase 側の `order` を変更する仕組みに拡張できます。

## 6. まとめ
- テーブルは `oneliner_reviews` と `oneliner_review_votes` の2つ。投票時は `review_id` と `voter_token` の組み合わせで重複を禁止。
- 匿名セッションでも `auth.role() = 'authenticated'` という条件で挿入を許可できる。
- 投票数はトリガーで自動更新し、フロント側でも即座に反映する。
- 問題が起きたら、`.env.local`（Supabase URL/Anon KEY）・RLS ポリシー・トリガー設定を確認。

この手順どおりにセットアップすれば、初心者でも同じ機能を再現することができます。困ったときは、テスト用ポリシー（`with check (true)`）で一度通ることを確認してから条件を絞り込むと原因を切り分けやすいです。
