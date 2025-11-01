import { OverlayComment } from "@/types/overlayComment";

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
    return comments;
  } catch (error) {
    console.error("Failed to fetch overlay comments", error);
    return [];
  }
}
