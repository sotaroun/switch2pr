import { NextResponse } from "next/server";

import {
  buildYoutubeWatchUrl,
  fetchYoutubeReviews,
} from "@/lib/youtube/client";

export type YoutubeReviewResponse = {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnailUrl?: string;
  viewCount?: number;
  likeCount?: number;
  url: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "missing_query" }, { status: 400 });
  }

  try {
    const reviews = await fetchYoutubeReviews(query);
    const payload: YoutubeReviewResponse[] = reviews.map((review) => ({
      ...review,
      url: buildYoutubeWatchUrl(review.videoId),
    }));

    return NextResponse.json({ items: payload }, {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("YouTube API request failed", error);
    return NextResponse.json({ error: "youtube_request_failed" }, { status: 500 });
  }
}
