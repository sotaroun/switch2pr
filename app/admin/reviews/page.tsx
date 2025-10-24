import { revalidatePath } from "next/cache";
import Link from "next/link";

import { getSupabaseServiceRoleClient } from "@/lib/supabase/server-client";
import { invokeReviewApprovalFunction } from "@/lib/supabase/review-approval";
import { sendReviewDecisionNotification } from "@/lib/slack/notifications";

type PendingReview = {
  id: string;
  gameId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

async function fetchPendingReviews(): Promise<PendingReview[]> {
  const client = getSupabaseServiceRoleClient();
  const { data, error } = await client
    .from("oneliner_reviews")
    .select("id, game_id, user_name, rating, comment, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (
    data?.map((item) => ({
      id: item.id,
      gameId: item.game_id,
      userName: item.user_name,
      rating: item.rating ?? 0,
      comment: item.comment ?? "",
      createdAt: item.created_at ?? "",
    })) ?? []
  );
}

async function handleReviewAction(formData: FormData) {
  "use server";

  const reviewId = formData.get("reviewId")?.toString();
  const action = formData.get("action")?.toString();
  const note = formData.get("note")?.toString() ?? null;

  if (!reviewId || !action) {
    return;
  }

  try {
    const result = await invokeReviewApprovalFunction({
      reviewId,
      action: action === "approve" ? "approve" : "reject",
      note,
      actor: "admin-dashboard",
    });

    await sendReviewDecisionNotification({
      reviewId,
      gameId: result.review.game_id,
      action: action === "approve" ? "approve" : "reject",
      actor: "admin-dashboard",
      note,
    });
  } catch (error) {
    console.error("Failed to process review action", error);
    throw error;
  }

  revalidatePath("/admin/reviews");
}

export default async function AdminReviewsPage() {
  let reviews: PendingReview[] = [];
  let loadError: string | null = null;

  try {
    reviews = await fetchPendingReviews();
  } catch (error) {
    console.error("Failed to load pending reviews", error);
    loadError = "レビューの取得に失敗しました。環境変数やSupabaseの設定を確認してください。";
  }

  return (
    <main style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "24px" }}>
        一言コメント 承認待ち一覧
      </h1>

      {loadError ? (
        <p style={{ color: "#ff6b6b" }}>{loadError}</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>承認待ちのコメントはありません。</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {reviews.map((review) => {
            return (
              <section
                key={review.id}
                style={{
                  borderRadius: "16px",
                  border: "1px solid rgba(148, 163, 184, 0.35)",
                  padding: "20px",
                  background: "rgba(15, 23, 42, 0.75)",
                  color: "rgba(248, 250, 252, 0.92)",
                }}
              >
                <header style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                      {review.userName} / ⭐ {review.rating}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "rgba(226, 232, 240, 0.75)" }}>
                      投稿日: {new Date(review.createdAt).toLocaleString("ja-JP")}
                    </div>
                  </div>
                  <Link
                    href={`/game/${review.gameId}`}
                    style={{ color: "#60a5fa", fontSize: "0.875rem" }}
                  >
                    ゲーム詳細を見る →
                  </Link>
                </header>

                <p style={{ marginTop: "12px", lineHeight: 1.6 }}>{review.comment}</p>

                <form
                  action={handleReviewAction}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    marginTop: "16px",
                  }}
                >
                  <input type="hidden" name="reviewId" value={review.id} />
                  <label style={{ fontSize: "0.85rem", color: "rgba(203, 213, 225, 0.9)" }}>
                    メモ（任意）:
                    <textarea
                      name="note"
                      placeholder="承認・却下の理由を残す場合に使用します"
                      style={{
                        width: "100%",
                        marginTop: "6px",
                        borderRadius: "8px",
                        border: "1px solid rgba(148, 163, 184, 0.35)",
                        padding: "8px",
                        background: "rgba(15, 23, 42, 0.6)",
                        color: "inherit",
                      }}
                    />
                  </label>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="submit"
                      name="action"
                      value="approve"
                      style={{
                        padding: "8px 16px",
                        borderRadius: "999px",
                        border: "none",
                        background: "rgba(74, 222, 128, 0.85)",
                        color: "#0f172a",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      承認する
                    </button>
                    <button
                      type="submit"
                      name="action"
                      value="reject"
                      style={{
                        padding: "8px 16px",
                        borderRadius: "999px",
                        border: "1px solid rgba(248, 113, 113, 0.85)",
                        background: "transparent",
                        color: "rgba(248, 113, 113, 0.9)",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      却下する
                    </button>
                  </div>
                </form>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
