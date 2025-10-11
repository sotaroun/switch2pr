const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";

const MAX_RESULTS = 8;
const DEFAULT_SUFFIX = " review";

export type YoutubeReviewItem = {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount?: number;
  likeCount?: number;
};

type YoutubeSearchResponse = {
  items?: Array<{
    id?: { videoId?: string | null } | null;
    snippet?: {
      title?: string | null;
      description?: string | null;
      publishedAt?: string | null;
      channelTitle?: string | null;
      channelId?: string | null;
      thumbnails?: {
        high?: { url?: string | null } | null;
        medium?: { url?: string | null } | null;
        default?: { url?: string | null } | null;
      } | null;
    } | null;
  }>;
};

type YoutubeVideosResponse = {
  items?: Array<{
    id?: string | null;
    snippet?: {
      title?: string | null;
      description?: string | null;
      publishedAt?: string | null;
      channelTitle?: string | null;
      channelId?: string | null;
      thumbnails?: {
        high?: { url?: string | null } | null;
        medium?: { url?: string | null } | null;
        default?: { url?: string | null } | null;
      } | null;
    } | null;
    statistics?: {
      viewCount?: string | null;
      likeCount?: string | null;
    } | null;
  }>;
};

function ensureApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error("YOUTUBE_API_KEY is not set. Please define it in your environment variables.");
  }
  return key;
}

function pickThumbnail(thumbnails?: {
  high?: { url?: string | null } | null;
  medium?: { url?: string | null } | null;
  default?: { url?: string | null } | null;
} | null): string | undefined {
  return (
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    undefined
  )?.toString();
}

export async function fetchYoutubeReviews(query: string): Promise<YoutubeReviewItem[]> {
  const apiKey = ensureApiKey();
  const searchParams = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    q: `${query}${DEFAULT_SUFFIX}`.trim(),
    maxResults: String(MAX_RESULTS),
    type: "video",
    safeSearch: "moderate",
  });

  const searchResponse = await fetch(`${SEARCH_URL}?${searchParams.toString()}`, {
    cache: "no-store",
  });

  if (!searchResponse.ok) {
    const text = await searchResponse.text();
    throw new Error(`YouTube search failed: ${searchResponse.status} ${text}`);
  }

  const searchJson = (await searchResponse.json()) as YoutubeSearchResponse;
  const videoIds = (searchJson.items ?? [])
    .map((item) => item.id?.videoId)
    .filter((id): id is string => Boolean(id));

  if (videoIds.length === 0) {
    return [];
  }

  const videosParams = new URLSearchParams({
    key: apiKey,
    part: "snippet,statistics",
    id: videoIds.join(","),
  });

  const videosResponse = await fetch(`${VIDEOS_URL}?${videosParams.toString()}`, {
    cache: "no-store",
  });

  if (!videosResponse.ok) {
    const text = await videosResponse.text();
    throw new Error(`YouTube videos fetch failed: ${videosResponse.status} ${text}`);
  }

  const videosJson = (await videosResponse.json()) as YoutubeVideosResponse;

  return (videosJson.items ?? [])
    .map((item) => {
      const id = item.id ?? undefined;
      if (!id) {
        return null;
      }

      const snippet = item.snippet ?? undefined;
      const statistics = item.statistics ?? undefined;

      return {
        videoId: id,
        title: snippet?.title ?? "",
        description: snippet?.description ?? "",
        channelTitle: snippet?.channelTitle ?? "",
        channelId: snippet?.channelId ?? "",
        publishedAt: snippet?.publishedAt ?? "",
        thumbnailUrl: pickThumbnail(snippet?.thumbnails),
        viewCount: statistics?.viewCount ? Number(statistics.viewCount) : undefined,
        likeCount: statistics?.likeCount ? Number(statistics.likeCount) : undefined,
      } satisfies YoutubeReviewItem;
    })
    .filter((item): item is YoutubeReviewItem => Boolean(item));
}

export function buildYoutubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
