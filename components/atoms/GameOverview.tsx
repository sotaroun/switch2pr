"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Heading,
  Text,
  HStack,
  Badge,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";

import { useGameOverview } from "@/lib/queries/useGameOverview";

// ゲーム詳細ページでゲームの基本情報（タイトル、概要、ジャンル）を表示するコンポーネント
export default function GameOverview() {
  const params = useParams();

  const rawId =
    (params as Record<string, string | string[] | undefined>).id ??
    (params as Record<string, string | string[] | undefined>).gameId;
  const gameId = typeof rawId === "string" ? rawId : null;

  const { data, loading, error } = useGameOverview(gameId);

  const summary = useMemo(() => data?.summary ?? "概要情報は未掲載です。", [data]);

  const cardProps = {
    p: 4,
    borderWidth: "1px",
    borderRadius: "xl",
    borderColor: "rgba(255, 255, 255, 0.08)",
    bg: "rgba(28, 28, 28, 0.9)",
    transition: "background 0.2s ease, border-color 0.2s ease",
    _hover: {
      bg: "rgba(42, 42, 42, 0.92)",
      borderColor: "rgba(255, 255, 255, 0.12)",
    },
  } as const;

  if (loading) {
    return (
      <Box {...cardProps}>
        <Skeleton height="28px" mb={3} />
        <SkeletonText noOfLines={3} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box {...cardProps}>
        <Heading size="md" mb={2} color="rgba(255, 255, 255, 0.92)">
          概要
        </Heading>
        <Text color="rgba(255, 255, 255, 0.6)">
          {error ?? "ゲーム情報が見つかりません。"}
        </Text>
      </Box>
    );
  }

  const genres = data.genres ?? [];
  const hasGenres = genres.length > 0;

  return (
    <Box {...cardProps}>
      <Heading size="md" mb={2} color="rgba(255, 255, 255, 0.95)">
        {data.name}
      </Heading>

      <Text whiteSpace="pre-wrap" lineHeight={1.8} color="rgba(255, 255, 255, 0.85)">
        {summary}
      </Text>

      {hasGenres && (
        <HStack mt={3} gap={2} flexWrap="wrap">
          {genres.map((genre) => (
            <Badge
              key={genre}
              colorScheme="gray"
              size="lg"
              cursor="pointer"
              bg="rgba(255, 255, 255, 0.08)"
              color="rgba(255, 255, 255, 0.85)"
              borderRadius="full"
              px={3}
              py={1}
              border="1px solid rgba(255, 255, 255, 0.12)"
              _hover={{
                bg: "rgba(255, 255, 255, 0.16)",
                color: "rgba(255, 255, 255, 0.95)",
              }}
              onClick={() => console.log(`ジャンル "${genre}" をクリック`)}
            >
              {genre}
            </Badge>
          ))}
        </HStack>
      )}
    </Box>
  );
}
