"use client";

import React from "react";
import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// v3 では extendTheme の代わりに createSystem を使う
const system = createSystem(defaultConfig, {});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ChakraProvider value={system}>{children}</ChakraProvider>
      </body>
    </html>
  );
}
