"use client";

import React from "react";
import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "../components/organisms/Header/Header"; // ← Netflix風ヘッダーを追加

// フォント設定
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Chakra v3 のシステム設定
const system = createSystem(defaultConfig, {});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Netflix風ヘッダーのメニュー設定
  const menus = [
    { menuLabel: "カテゴリ", href: "/category" },
    { menuLabel: "検索", href: "/search" },
  ];

  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ margin: 0, backgroundColor: "#000" }} 
      >
        <ChakraProvider value={system}>
          {/* ✅ 全ページ共通のヘッダー */}
          <Header menus={menus} />

          {/* ✅ 各ページのメインコンテンツ */}
          <main>{children}</main>
        </ChakraProvider>
      </body>
    </html>
  );
}
