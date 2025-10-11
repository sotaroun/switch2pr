import { getIgdbToken } from "./auth";

const IGDB_API_BASE_URL = "https://api.igdb.com/v4";

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
