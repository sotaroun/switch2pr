import "./globals.css";
import { Metadata } from "next";
import ClientLayout from "./ClientLayout";
import { Toaster, toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "カテゴリ別ゲーム検索 - GameReview Hub",
  description:
    "ジャンル別にゲームを検索。アクション、RPG、シューティングなど、お好みのカテゴリからゲームを見つけよう。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientLayout>
      {children}

      <Toaster toaster={toaster}>
        {(toast) => (
          <div
            style={{
              background: "rgba(30, 30, 30, 0.9)",
              color: "white",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {toast.title}
          </div>
        )}
      </Toaster>
    </ClientLayout>
  );
}
