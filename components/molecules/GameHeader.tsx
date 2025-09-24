"use client";

import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import { GameImage } from "@/components/atoms/GameImage";
import GameOverview from "@/components/atoms/GameOverview";

// ゲーム詳細ページのヘッダー部分（画像 + 基本情報）を表示するコンポーネント
// 既存のatomsコンポーネントを組み合わせて構成
export default function GameHeader() {
  return (
    <Box p={6} borderWidth="1px" borderRadius="xl">
      <Flex gap={6} align="flex-start">
        {/* ゲーム画像部分 */}
        <Box flexShrink={0}>
          <GameImage />
        </Box>

        {/* ゲーム概要部分 */}
        <Box flex="1">
          <GameOverview />
        </Box>
      </Flex>
    </Box>
  );
}
