import type { Source, SortTab } from "./types";

export const sourceLabels: Record<Source, string> = {
  youtube: "YouTube口コミ",
  oneliner: "一言コメント",
};

export const sourceButtonThemes: Record<Source, {
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
};

export const sourceOrder: Source[] = ["youtube", "oneliner"];

export const sortOptions: Record<Source, SortTab[]> = {
  youtube: [
    { label: "新着順", isActive: true },
    { label: "高評価順" },
  ],
  oneliner: [
    { label: "新着順", isActive: true },
    { label: "評価順" },
    { label: "参考になった順" },
  ],
};
