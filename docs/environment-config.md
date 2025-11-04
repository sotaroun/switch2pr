# 環境変数の設定について

本プロジェクトをローカル開発や本番環境で動かす際に必要となる主な環境変数と、その設定方法をまとめます。  
`.env.example` を参考に `.env.local`（ローカル開発用）や Vercel の環境変数設定にコピーして使用してください。

## 1. IGDB 関連
| 変数名 | 必須 | 説明 |
| --- | --- | --- |
| `IGDB_CLIENT_ID` | ✅ | IGDB API を利用するための Client ID |
| `IGDB_CLIENT_SECRET` | ✅ | IGDB API を利用するための Client Secret |

IGDB Console から取得できます。トークンの有効期限切れに注意してください。

## 2. Supabase
| 変数名 | 必須 | 説明 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase プロジェクトの URL（フロントエンドから参照） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Anon Key（フロントエンドから参照） |
| `SUPABASE_SERVICE_ROLE_KEY` | 任意 | サーバーサイドで権限の高い操作が必要な場合に使用 |
| `SUPABASE_FUNCTIONS_BASE_URL` | 任意 | Edge Functions を利用する場合に設定 |

## 3. Slack Webhook / Actions
| 変数名 | 必須 | 説明 |
| --- | --- | --- |
| `SLACK_WEBHOOK_URL` | 任意 | Slack 通知を飛ばす場合に使用 |
| `SLACK_SIGNING_SECRET` | 任意 | Slack からのリクエストを検証する場合に使用 |

## 4. YouTube Data API
| 変数名 | 必須 | 説明 |
| --- | --- | --- |
| `YOUTUBE_API_KEY` | 任意 | YouTube 動画情報を取得する機能が有効な場合に必要 |

## 5. サイトURL / その他
| 変数名 | 必須 | 説明 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 任意 | フロントエンドで利用するサイトURL。Slack通知などで使用 |
| `SITE_URL` | 任意 | サーバー側で利用するサイトURL。設定がない場合は `NEXT_PUBLIC_SITE_URL` などを参照 |
| `ADMIN_BASIC_USER` / `ADMIN_BASIC_PASS` | 任意 | 管理画面にベーシック認証を掛ける場合のユーザー名・パスワード |

## 6. 推奨ファイル構成
- `/.env.example` … テンプレート。値は入れずにコメントを残す
- `/app/.env.local` … ローカル開発で使用（Git にはコミットしない）
- Vercel や Supabase の設定画面に本番用の値を登録

## 7. TIPS
- `.env.local` は Next.js の仕様で `npm run dev` 時に自動で読み込まれます。  
  本番環境では Vercel の Project Settings で同じキーを登録してください。
- セキュリティ上、秘密鍵（Client Secret や Service Role Key）は絶対にリポジトリに含めないよう注意してください。
- 変更後はアプリを再起動するか、Vercel の場合は再デプロイを行ってください。
