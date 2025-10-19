import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;

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
