const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_API_BASE_URL = "https://api.igdb.com/v4";
const EXPIRY_BUFFER_MS = 60_000; // 1 minute safety margin

type CachedToken = {
  token: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;

function assertEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`IGDB ${key} is not set. Please define ${key} in your environment variables.`);
  }
  return value;
}

async function requestIgdbToken(): Promise<CachedToken> {
  const clientId = assertEnv(process.env.IGDB_CLIENT_ID, "IGDB_CLIENT_ID");
  const clientSecret = assertEnv(process.env.IGDB_CLIENT_SECRET, "IGDB_CLIENT_SECRET");

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to obtain IGDB token: ${response.status} ${text}`);
  }

  const json = (await response.json()) as { access_token: string; expires_in: number };
  const expiresAt = Date.now() + json.expires_in * 1000;

  cachedToken = {
    token: json.access_token,
    expiresAt,
  };

  return cachedToken;
}

export async function getIgdbToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - EXPIRY_BUFFER_MS > Date.now()) {
    return cachedToken.token;
  }

  const token = await requestIgdbToken();
  return token.token;
}

export async function igdbRequest<T>(endpoint: string, body: string): Promise<T> {
  const token = await getIgdbToken();
  const clientId = process.env.IGDB_CLIENT_ID;
  if (!clientId) {
    throw new Error("IGDB_CLIENT_ID is not set. Please check your environment variables.");
  }

  const response = await fetch(`${IGDB_API_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`IGDB request failed: ${response.status} ${text}`);
  }

  return (await response.json()) as T;
}

export function buildCoverUrl(imageId?: string | null): string | undefined {
  if (!imageId) return undefined;
  return `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`;
}

export function buildScreenshotUrl(imageId?: string | null): string | undefined {
  if (!imageId) return undefined;
  return `https://images.igdb.com/igdb/image/upload/t_screenshot_huge/${imageId}.jpg`;
}
