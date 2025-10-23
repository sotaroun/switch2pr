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

  if (loading) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="xl">
        <Skeleton height="28px" mb={3} />
        <SkeletonText noOfLines={3} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="xl">
        <Heading size="md" mb={2}>
          概要
        </Heading>
        <Text color="gray.500">{error ?? "ゲーム情報が見つかりません。"}</Text>
      </Box>
    );
  }

  const genres = data.genres ?? [];
  const hasGenres = genres.length > 0;

  return (
    <Box p={4} borderWidth="1px" borderRadius="xl">
      <Heading size="md" mb={2}>
        {data.name}
      </Heading>

      <Text whiteSpace="pre-wrap" lineHeight={1.8}>
        {summary}
      </Text>

      {hasGenres && (
        <HStack mt={3} gap={2} flexWrap="wrap">
          {genres.map((genre) => (
            <Badge
              key={genre}
              colorScheme="blue"
              size="lg"
              cursor="pointer"
              _hover={{ bg: "blue.600" }}
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
