import "./globals.css";
import { Metadata } from "next";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "カテゴリ別ゲーム検索 - GameReview Hub",
  description:
    "ジャンル別にゲームを検索。アクション、RPG、シューティングなど、お好みのカテゴリからゲームを見つけよう。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
