# トップページ改修 計画書（初心者向け）

## ゴール
1. トップページ（`app/page.tsx`）で **リアルなゲームデータ** を表示できるようにする（IGDB 経由）。
2. ゲームカードにマウスを乗せたとき、**一言コメントの「流れる演出」** を表示する。

---

## 全体の流れ（ざっくり）
1. **ゲームデータの入口を作る**  
   - `/api/games` を Supabase or IGDB から本物のデータを返す API にする。
2. **トップページで API を呼ぶ**  
   - `app/page.tsx` で `fetch("/api/games")` → `useEffect` で State に格納 → 横スクロールに流す。
3. **hover した時のコメント取得と演出**  
   - detail page で使っている `useOverlayComments` と `OverlayComments` をトップページでも再利用。
   - hover 中のゲーム ID を管理し、コメントが「横から流れる」演出を表示する。

---

## ステップ詳細

### 1. `/api/games` を整える
- 現状は固定配列を返している想定。ここを **Supabase** や **IGDB** を使った実装に差し替える。
  1. Supabase に `games` テーブル（`id`, `title`, `categories`, `coverUrl` など）を用意。
  2. `app/api/games/route.ts` で Supabase クライアントを使い、ゲーム一覧を取得して返す。
     ```ts
     import { getSupabaseServiceRoleClient } from "@/lib/api/supabase";

     export async function GET() {
       const supabase = getSupabaseServiceRoleClient();
       const { data, error } = await supabase.from("games").select("*");
       // エラー処理 → JSON で返す
     }
     ```
  3. IGDB を直接叩いてもOKだが、毎回コールすると遅くなるので基本は Supabase にキャッシュしておくと楽。

### 2. トップページでデータを受け取る
- `app/page.tsx` を以下の流れに変更：
  1. `const [games, setGames] = useState<Game[]>([])` を追加（`Game` は `types/game.ts` の型を流用）。
  2. `useEffect` で `/api/games` をフェッチ → `setGames` する。
  3. `dummyGames` の代わりに API から取得した `games` を渡す。
  4. 失敗時のエラーハンドリングも忘れずに（`setError` など）。
  5. Supabase が未設定の環境向けに、フェッチ失敗時はフェールセーフで `dummyGames` を使う処理を残しても OK。

### 3. hover 時のコメント表示を組み込む
- detail page と同じ仕組みをトップページへ移植。
  1. `app/category/page.tsx` を参考にする。
  2. State を追加：
     ```ts
     const [hoveredGameId, setHoveredGameId] = useState<string | null>(null);

     const fetchComments = useCallback((gameId: string) => {
       return fetchOverlayCommentsAPI(gameId); // lib/overlayComments.ts（モック or Supabase 連携）
     }, []);

     const { comments, isLoading, startHover, endHover } = useOverlayComments({
       gameId: hoveredGameId,
       fetchComments,
       maxDisplay: 20,
       totalLanes: 20,
     });
     ```
  3. `HorizontalGameList` に `onGameHover`/`onGameLeave` プロップを渡す。
     ```tsx
     <HorizontalGameList
       title="新作ゲーム"
       games={games}
       onGameClick={handleGameClick}
       onGameHover={(gameId) => {
         setHoveredGameId(gameId);
         startHover();
       }}
       onGameLeave={() => {
         endHover();
         setHoveredGameId(null);
       }}
     />
     ```
  4. ページ内に `OverlayComments` を描画：
     ```tsx
     <OverlayComments comments={comments} totalLanes={20} />
     ```
  5. コメントデータは Supabase の `oneliner_reviews`（detail page と同じ）から取得されるため、実際には `fetchOverlayCommentsAPI` を Supabase 連携に差し替えるのが理想。

### 4. カード側の対応
- `components/organisms/game/HorizontalGameList.tsx` を確認：
  - 既に `onGameHover` / `onGameLeave` を props で受け取り、`GameCard` の hover イベントで呼んでいる（カテゴリページと同じ）。
  - 足りない場合は `onMouseEnter`, `onMouseLeave` を `GameCard` 側で渡す。

### 5. 見た目の調整
- コメントが流れる演出は `OverlayComments` 内の CSS アニメーションで実現済み。
- トップページでも同様に使えるが、ページ最上部に固定表示されるため、邪魔な場合は `position` や `z-index` を調整。

---

## 想定される躓きポイントと補足

- **Supabase 設定が必須**：URL と API KEY が `.env` にないと API が落ちる。ローカルで動かす場合は `.env.local` をセット。
- **IGDB のレート制限**：直接 API を叩くと遅い＆回数制限があるので、Supabase にバッチでデータを同期しておいて `/api/games` から供給するのが現実的。
- **`OverlayComments` はブラウザ限定**：`useOverlayComments` では `window` や `localStorage` を使っていないが、今後利用する場合は SSR ではなく client component でのみ呼ぶように注意。
- **ハンドラ渡し忘れに注意**：`HorizontalGameList` → `GameCard` への `onMouseEnter` など、パスが長いので props の渡し漏れがないか確認。

---

## 次にやることチェックリスト
- [ ] Supabase に `games` テーブルを用意＆データ投入
- [ ] `/api/games` を Supabase fetch に書き換え
- [ ] `app/page.tsx` で `/api/games` を fetch → state に反映
- [ ] hover 用の state + `useOverlayComments` を導入
- [ ] `HorizontalGameList` と `OverlayComments` の連携を確認
- [ ] 仕上げに手動で表示を確認（新作ゲーム・人気ゲームセクション）

これで detail page 以外からも API 連携が始められます。今後、カテゴリページや他のセクションでも同じ仕組みを活用していくと、サイト全体で統一感のある動的表示が実現できます。
