"use client"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChakraProvider,createSystem,defaultConfig,defaultSystem  } from "@chakra-ui/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const theme = createSystem(defaultConfig,{});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ChakraProvider value={theme}>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}
