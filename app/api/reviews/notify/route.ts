import { NextResponse } from "next/server";

import { sendReviewNotification } from "@/lib/slack/notifications";

type ReviewNotificationRequest = {
  gameId?: string;
  userName?: string;
  rating?: number;
  comment?: string;
  reviewId?: string | null;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ReviewNotificationRequest;
  const { gameId, userName, rating, comment, reviewId } = body;

  if (!gameId || !userName || typeof rating !== "number" || !comment) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    await sendReviewNotification({
      reviewId,
      gameId,
      userName,
      rating,
      comment,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to send Slack notification", error);
    return NextResponse.json({ error: "notification_failed" }, { status: 500 });
  }
}
