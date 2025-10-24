const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const COMMENT_THREADS_URL = "https://www.googleapis.com/youtube/v3/commentThreads";

const MAX_VIDEO_CANDIDATES = 8;
const MAX_TOTAL_COMMENTS = 15;
const MAX_COMMENTS_PER_VIDEO = 5;

const OFFICIAL_KEYWORDS = ["公式", "official", "オフィシャル"];
const REVIEW_KEYWORDS = ["レビュー", "感想", "評価", "解説", "考察", "紹介"];
const IGNORE_COMMENT_PHRASES = [
  "目次",
  "再生リスト",
  "playlist",
  "こちら",
  "リンクはこちら",
  "続きはこちら",
  "chapter",
];

// 既知の公式チャンネル ID を登録していけば精度が上がる（必要に応じて拡張）。
const KNOWN_OFFICIAL_CHANNEL_IDS = new Set<string>([]);

export type YoutubeGameComment = {
  videoId: string;
  videoTitle: string;
  channelTitle: string;
  channelId: string;
  channelUrl: string;
  comment: string;
  author: string;
  publishedAt: string;
  likeCount?: number;
  url: string;
  isOfficialLike: boolean;
};

type YoutubeSearchResponse = {
  items?: Array<{
    id?: { videoId?: string | null } | null;
    snippet?: {
      title?: string | null;
      description?: string | null;
      channelTitle?: string | null;
      channelId?: string | null;
      publishedAt?: string | null;
    } | null;
  }>;
};

type CommentThreadsResponse = {
  items?: Array<{
    id?: string | null;
    snippet?: {
      videoId?: string | null;
      topLevelComment?: {
        id?: string | null;
        snippet?: {
          textOriginal?: string | null;
          authorDisplayName?: string | null;
          likeCount?: number | null;
          publishedAt?: string | null;
        } | null;
      } | null;
      canReply?: boolean | null;
      totalReplyCount?: number | null;
      isPublic?: boolean | null;
    } | null;
  }>;
};

function ensureApiKey(): string {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is not set. Please define it in your environment variables.");
  }
  return apiKey;
}

function includesKeyword(value: string | undefined | null, keywords: string[]): boolean {
  if (!value) return false;
  const lower = value.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

function calcOfficialScore(channelTitle?: string | null, videoTitle?: string | null, channelId?: string | null): number {
  let score = 0;
  if (channelId && KNOWN_OFFICIAL_CHANNEL_IDS.has(channelId)) {
    score += 10;
  }
  if (includesKeyword(channelTitle, OFFICIAL_KEYWORDS)) {
    score += 5;
  }
  if (includesKeyword(videoTitle, OFFICIAL_KEYWORDS)) {
    score += 3;
  }
  return score;
}

function calcReviewScore(channelTitle?: string | null, videoTitle?: string | null, description?: string | null): number {
  let score = 0;
  if (includesKeyword(videoTitle, REVIEW_KEYWORDS)) score += 3;
  if (includesKeyword(description, REVIEW_KEYWORDS)) score += 2;
  if (includesKeyword(channelTitle, REVIEW_KEYWORDS)) score += 1;
  return score;
}

async function fetchCommentsForVideo(videoId: string, maxResults: number, apiKey: string) {
  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    videoId,
    maxResults: String(maxResults),
    textFormat: "plainText",
    order: "relevance",
  });

  const response = await fetch(`${COMMENT_THREADS_URL}?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`YouTube comments fetch failed: ${response.status} ${text}`);
  }

  const json = (await response.json()) as CommentThreadsResponse;
  return (json.items ?? [])
    .map((item) => {
      const commentSnippet = item.snippet?.topLevelComment?.snippet;
      if (!commentSnippet?.textOriginal) {
        return null;
      }

      const textOriginal = commentSnippet.textOriginal.trim();
      if (
        IGNORE_COMMENT_PHRASES.some((phrase) =>
          textOriginal.toLowerCase().includes(phrase.toLowerCase())
        )
      ) {
        return null;
      }

      return {
        commentId: item.snippet?.topLevelComment?.id ?? undefined,
        comment: textOriginal,
        author: commentSnippet.authorDisplayName ?? "匿名ユーザー",
        likeCount: commentSnippet.likeCount ?? undefined,
        publishedAt: commentSnippet.publishedAt ?? "",
      };
    })
    .filter((item): item is {
      commentId?: string;
      comment: string;
      author: string;
      likeCount?: number;
      publishedAt: string;
    } => Boolean(item));
}

export async function fetchYoutubeGameComments(query: string): Promise<YoutubeGameComment[]> {
  const apiKey = ensureApiKey();
  const searchParams = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    q: `${query} レビュー`,
    regionCode: "JP",
    relevanceLanguage: "ja",
    type: "video",
    maxResults: String(MAX_VIDEO_CANDIDATES),
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
  const candidates = (searchJson.items ?? [])
    .map((item) => {
      const videoId = item.id?.videoId ?? undefined;
      if (!videoId) {
        return null;
      }

      const snippet = item.snippet ?? undefined;
      const officialScore = calcOfficialScore(snippet?.channelTitle, snippet?.title, snippet?.channelId);
      const reviewScore = calcReviewScore(snippet?.channelTitle, snippet?.title, snippet?.description);

      return {
        videoId,
        videoTitle: snippet?.title ?? "",
        channelTitle: snippet?.channelTitle ?? "",
        channelId: snippet?.channelId ?? "",
        publishedAt: snippet?.publishedAt ?? "",
        officialScore,
        reviewScore,
        totalScore: officialScore * 10 + reviewScore,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => b.totalScore - a.totalScore);

  const results: YoutubeGameComment[] = [];

  for (const candidate of candidates) {
    if (results.length >= MAX_TOTAL_COMMENTS) {
      break;
    }

    try {
      const remaining = MAX_TOTAL_COMMENTS - results.length;
      const comments = await fetchCommentsForVideo(
        candidate.videoId,
        Math.min(MAX_COMMENTS_PER_VIDEO, remaining),
        apiKey
      );

      if (comments.length === 0) {
        continue;
      }

      const isOfficialLike = candidate.officialScore > 0;
      for (const comment of comments) {
        if (results.length >= MAX_TOTAL_COMMENTS) break;

        const commentUrl = comment.commentId
          ? `https://www.youtube.com/watch?v=${candidate.videoId}&lc=${comment.commentId}`
          : `https://www.youtube.com/watch?v=${candidate.videoId}`;
        const channelUrl = candidate.channelId
          ? `https://www.youtube.com/channel/${candidate.channelId}`
          : `https://www.youtube.com/results?search_query=${encodeURIComponent(candidate.channelTitle)}`;

        results.push({
          videoId: candidate.videoId,
          videoTitle: candidate.videoTitle,
          channelTitle: candidate.channelTitle,
          channelId: candidate.channelId,
          channelUrl,
          comment: comment.comment,
          author: comment.author,
          publishedAt: comment.publishedAt,
          likeCount: comment.likeCount,
          url: commentUrl,
          isOfficialLike,
        });
      }
    } catch (error) {
      console.error("Failed to fetch comments for video", candidate.videoId, error);
      continue;
    }
  }

  return results;
}
