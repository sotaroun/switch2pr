import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let browserClient: SupabaseClient | null = null;

export const REVIEW_VOTER_STORAGE_KEY = "switch2pr_review_token";

export function getBrowserSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase client requested without configuration");
  }

  if (browserClient) {
    return browserClient;
  }

  browserClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: true,
      storageKey: "switch2pr_auth",
    },
  });

  return browserClient;
}

export async function ensureAnonReviewSession(
  client = getBrowserSupabaseClient()
): Promise<{ voterToken: string; session: Session }> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase session requested without configuration");
  }

  if (typeof window === "undefined") {
    throw new Error("ensureAnonReviewSession must be called in the browser");
  }

  const [sessionResult, storedToken] = await Promise.all([
    client.auth.getSession(),
    Promise.resolve(localStorage.getItem(REVIEW_VOTER_STORAGE_KEY)),
  ]);

  const session = sessionResult.data.session;
  let voterToken = storedToken;

  if (!session) {
    const { data, error } = await client.auth.signInAnonymously();
    if (error) {
      throw error;
    }
    if (!data.session) {
      throw new Error("Failed to establish anonymous session");
    }
    return ensureAnonReviewSession(client);
  }

  if (!voterToken) {
    voterToken = crypto.randomUUID();
    localStorage.setItem(REVIEW_VOTER_STORAGE_KEY, voterToken);
  }

  const currentMetadata = session.user.user_metadata ?? {};
  if (currentMetadata.role !== "anon" || currentMetadata.voter_token !== voterToken) {
    const { error } = await client.auth.updateUser({
      data: { role: "anon", voter_token: voterToken },
    });
    if (error) {
      throw error;
    }
  }

  return { voterToken, session };
}

export function getSupabaseServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createClient(url, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

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
