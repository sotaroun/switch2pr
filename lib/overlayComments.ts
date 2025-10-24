import { OverlayComment } from "@/types/overlayComment";

const FALLBACK_COMMENTS: OverlayComment[] = [
  { id: "fallback-1", content: "このゲーム最高！", createdAt: new Date().toISOString() },
  { id: "fallback-2", content: "操作性が気持ちいい", createdAt: new Date().toISOString() },
  { id: "fallback-3", content: "週末はこれで遊びます", createdAt: new Date().toISOString() },
];

/**
 * 一言コメントを取得する API
 */
export async function fetchOverlayCommentsAPI(gameId: string): Promise<OverlayComment[]> {
  try {
    const response = await fetch(`/api/reviews/oneliner/${gameId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch overlay comments: ${response.status}`);
    }

    const comments = (await response.json()) as OverlayComment[];
    const result = comments.length > 0 ? comments : FALLBACK_COMMENTS;
    console.log("[overlay] fetch comments", gameId, result.length);
    return result;
  } catch (error) {
    console.error("Failed to fetch overlay comments", error);
    return FALLBACK_COMMENTS;
  }
}
