export const formatDate = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export const buildHelpfulStorageKey = (
  gameId: string | null,
  review: { user?: string; postedAt?: string; comment?: string }
) => {
  const game = gameId ?? "unknown";
  const user = review.user ?? "";
  const posted = review.postedAt ?? "";
  return `${game}::${user}::${posted}::${review.comment ?? ""}`;
};
