const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getFunctionEndpoint() {
  const base =
    process.env.SUPABASE_FUNCTIONS_BASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!base) {
    throw new Error("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) is not set");
  }

  return `${base.replace(/\/$/, "")}/functions/v1/approve-oneliner-review`;
}

type ReviewActionPayload = {
  reviewId: string;
  action: "approve" | "reject";
  note?: string | null;
  actor?: string | null;
};

export type ReviewActionResponse = {
  ok: boolean;
  review: {
    id: string;
    game_id: string;
    user_name: string;
    rating: number | null;
    comment: string | null;
    status: string;
    approved_at: string | null;
    admin_note: string | null;
  };
};

export async function invokeReviewApprovalFunction(
  payload: ReviewActionPayload
): Promise<ReviewActionResponse> {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  const response = await fetch(getFunctionEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Review approval function failed: ${response.status} ${text}`);
  }

  return (await response.json()) as ReviewActionResponse;
}
