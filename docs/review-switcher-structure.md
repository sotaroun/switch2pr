# Review Switcher Table Breakdown

## Organism
- `components/organisms/ReviewSwitcherTable.tsx` – Fetches review data, coordinates source switching, helpful投票のローカル状態、テーブル描画をまとめるコンテナ。

## Molecules
- `components/molecules/review-table/ReviewSourceToggle.tsx` – YouTube/一言コメントのトグルボタン群。アクティブ状態に応じた配色とアイコンを制御。
- `components/molecules/review-table/ReviewTableHeader.tsx` – 見出しエリア。ソースアイコン・タイトル・件数サマリ・ソートタブのレイアウトを担当。
- `components/molecules/review-table/columns.tsx` – テーブル列定義の共通化。YouTube/一言コメントで使う列とレンダラーを集約。
- `components/molecules/review-table/config.ts` – ソースごとのラベル・カラー・ソートタブ設定を保持。
- `components/molecules/review-table/types.ts` – レビューの型・列定義・ソース型など共通型を定義。
- `components/molecules/review-table/utils.ts` – 日付フォーマットと参考投票キー生成などの共通ユーティリティ。

## Atoms
- `components/atoms/icons/YouTubeIcon.tsx` / `components/atoms/icons/BubbleIcon.tsx` – ソース切り替えやヘッダーで使う単機能アイコン。
- `components/atoms/ChannelTag.tsx` – YouTubeチャンネル名を示すタグ表示。
- `components/atoms/HelpfulVoteButton.tsx` – 「参考になった」ボタンとカウント表示。押下/無効時のスタイルを持つ。
- `components/atoms/StatusBadge.tsx` – ステータス列の角丸バッジ。
- `components/atoms/StarRatingDisplay.tsx` – 読み取り専用の星評価表示（内部で `RatingStars` を保持）。
