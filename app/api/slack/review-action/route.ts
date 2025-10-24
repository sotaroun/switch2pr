import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

import { sendReviewDecisionNotification } from "@/lib/api/slack";
import { invokeReviewApprovalFunction } from "@/lib/api/supabase";

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

function verifySlackRequest(signature: string | null, timestamp: string | null, body: string) {
  if (!SLACK_SIGNING_SECRET || !signature || !timestamp) {
    return false;
  }

  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (Number(timestamp) < fiveMinutesAgo) {
    return false;
  }

  const sigBaseString = `v0:${timestamp}:${body}`;
  const mySignature = `v0=${createHmac("sha256", SLACK_SIGNING_SECRET).update(sigBaseString).digest("hex")}`;

  try {
    return timingSafeEqual(Buffer.from(mySignature), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const bodyText = await request.text();
  const signature = request.headers.get("x-slack-signature");
  const timestamp = request.headers.get("x-slack-request-timestamp");

  if (!verifySlackRequest(signature, timestamp, bodyText)) {
    return new NextResponse("invalid signature", { status: 401 });
  }

  const params = new URLSearchParams(bodyText);
  const payloadRaw = params.get("payload");

  if (!payloadRaw) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const payload = JSON.parse(payloadRaw) as {
    actions?: Array<{ action_id?: string; value?: string }>;
    user?: { id?: string; username?: string; name?: string };
    response_url?: string;
  };

  const action = payload.actions?.[0];
  if (!action?.value) {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  let value: { reviewId?: string; gameId?: string; action?: "approve" | "reject" };
  try {
    value = JSON.parse(action.value);
  } catch {
    return NextResponse.json({ error: "invalid_action_value" }, { status: 400 });
  }

  if (!value.reviewId || (value.action !== "approve" && value.action !== "reject")) {
    return NextResponse.json({ error: "invalid_action_value" }, { status: 400 });
  }

  const actor = payload.user?.username ?? payload.user?.name ?? payload.user?.id ?? "slack_user";

  try {
    const result = await invokeReviewApprovalFunction({
      reviewId: value.reviewId,
      action: value.action,
      actor,
    });

    await sendReviewDecisionNotification({
      reviewId: value.reviewId,
      gameId: result.review.game_id,
      action: value.action,
      actor,
    });

    if (payload.response_url) {
      await fetch(payload.response_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          replace_original: true,
          text: `レビュー(${value.reviewId})を${value.action === "approve" ? "承認" : "却下"}しました。`,
        }),
      });
    }

    return NextResponse.json({
      response_type: "ephemeral",
      text: "対応しました。ありがとうございます！",
    });
  } catch (error) {
    console.error("Slack review action failed", error);
    return NextResponse.json({ error: "review_action_failed" }, { status: 500 });
  }
}
