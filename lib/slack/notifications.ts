const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  process.env.SITE_URL?.replace(/\/$/, "") ??
  "https://example.com";

type ReviewNotificationPayload = {
  reviewId?: string | null;
  gameId: string;
  userName: string;
  rating: number;
  comment: string;
};

type ReviewDecisionPayload = {
  reviewId: string;
  gameId: string;
  action: "approve" | "reject";
  actor?: string | null;
  note?: string | null;
};

async function postToSlack(message: unknown) {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL is not set. Skipping Slack notification.");
    return;
  }

  const response = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Slack notification failed: ${response.status} ${body}`);
  }
}

export async function sendReviewNotification(payload: ReviewNotificationPayload) {
  const { reviewId, gameId, userName, rating, comment } = payload;

  const blocks: unknown[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*新しい一言コメントが投稿されました*\nゲーム: <${SITE_ORIGIN}/game/${gameId}|/game/${gameId}>\nユーザー: ${userName}\n評価: ${"⭐".repeat(rating)} (${rating}/5)\nコメント:\n>${comment}`,
      },
    },
  ];

  blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        text: { type: "plain_text", text: "管理画面を開く" },
        url: `${SITE_ORIGIN}/admin/reviews`,
      },
    ],
  });

  await postToSlack({
    text: "新しい一言コメントが投稿されました",
    blocks,
  });
}

export async function sendReviewDecisionNotification(payload: ReviewDecisionPayload) {
  const { reviewId, gameId, action, actor, note } = payload;
  const decisionText = action === "approve" ? "承認" : "却下";

  await postToSlack({
    text: `レビュー ${decisionText}: ${reviewId}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:white_check_mark: レビューが${decisionText}されました。\n- ゲーム: <${SITE_ORIGIN}/game/${gameId}|/game/${gameId}>\n- レビューID: \`${reviewId}\`\n- 操作: *${decisionText}*\n- 実行者: ${actor ?? "不明"}${note ? `\n- メモ: ${note}` : ""}`,
        },
      },
    ],
  });
}
