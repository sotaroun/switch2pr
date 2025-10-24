import { NextResponse } from "next/server";

import { fetchYoutubeGameComments } from "@/lib/youtube/client";

export type YoutubeReviewResponse = {
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "missing_query" }, { status: 400 });
  }

  try {
    const reviews = await fetchYoutubeGameComments(query);
    return NextResponse.json({ items: reviews }, {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("YouTube API request failed", error);
    return NextResponse.json({ error: "youtube_request_failed" }, { status: 500 });
  }
}
