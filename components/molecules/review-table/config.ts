import type {
  OnelinerSortKey,
  ReviewTabKey,
  Source,
  YoutubeSortKey,
} from "./types";

export const tabLabels: Record<ReviewTabKey, string> = {
  youtube: "YouTube口コミ",
  oneliner: "一言コメント",
  form: "レビュー投稿",
};

export const tabButtonThemes: Record<ReviewTabKey, {
  idleBg: string;
  idleColor: string;
  hoverBg: string;
  hoverColor: string;
  activeBg: string;
  activeColor: string;
  shadow: string;
}> = {
  youtube: {
    idleBg: "rgba(255, 74, 96, 0.16)",
    idleColor: "rgba(255,255,255,0.82)",
    hoverBg: "#ff3145",
    hoverColor: "white",
    activeBg: "#ff2231",
    activeColor: "white",
    shadow: "0 6px 24px rgba(255, 58, 84, 0.38)",
  },
  oneliner: {
    idleBg: "rgba(77, 166, 255, 0.18)",
    idleColor: "rgba(255,255,255,0.82)",
    hoverBg: "#2f9dff",
    hoverColor: "white",
    activeBg: "#1f7cff",
    activeColor: "white",
    shadow: "0 6px 24px rgba(41, 146, 255, 0.38)",
  },
  form: {
    idleBg: "rgba(137, 212, 116, 0.18)",
    idleColor: "rgba(255,255,255,0.82)",
    hoverBg: "#6fd26f",
    hoverColor: "white",
    activeBg: "#57c057",
    activeColor: "white",
    shadow: "0 6px 24px rgba(87, 192, 87, 0.35)",
  },
};

export const tabOrder: ReviewTabKey[] = ["youtube", "oneliner", "form"];

export const youtubeSortOptions: Array<{ label: string; value: YoutubeSortKey }> = [
  { label: "新着順", value: "published_desc" },
  { label: "高評価順", value: "like_desc" },
];

export const onelinerSortOptions: Array<{ label: string; value: OnelinerSortKey }> = [
  { label: "新着順", value: "posted_desc" },
  { label: "評価順", value: "rating_desc" },
  { label: "参考になった順", value: "helpful_desc" },
];

export const sortOptions: Record<Source, Array<{ label: string; value: string }>> = {
  youtube: youtubeSortOptions,
  oneliner: onelinerSortOptions,
};
