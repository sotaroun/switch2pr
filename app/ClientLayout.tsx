"use client";

import React from "react";
import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "../components/organisms/Header/Header";
import { Toaster, toaster } from "@/components/ui/toaster";

// フォント設定
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Chakra v3 のシステム設定
const system = createSystem(defaultConfig, {});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
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
          <Header menus={menus} />
          <main>{children}</main>
          
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
        </ChakraProvider>
      </body>
    </html>
  );
}