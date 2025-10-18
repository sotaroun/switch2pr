"use client";

import { useEffect, useState } from "react";
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

import type { GameDetailResponse, GameOverviewMock } from "@/types/game-detail";

type OverviewData = {
  name: string;
  summary: string;
  genres: string[];
};

// ゲーム詳細ページでゲームの基本情報（タイトル、概要、ジャンル）を表示するコンポーネント
export default function GameOverview() {
  const params = useParams();

  // URLパラメータからゲームIDを取得（id または gameId のどちらでも対応）
  const rawId =
    (params as Record<string, string | string[] | undefined>).id ??
    (params as Record<string, string | string[] | undefined>).gameId;
  const gameId = typeof rawId === "string" ? rawId : null;

  // ゲームデータとローディング状態を管理
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  // ゲームIDが変更された時にAPIからデータを取得
  useEffect(() => {
    // ゲームIDがない場合は早期リターン
    if (!gameId) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    let cancelled = false;

    const resolveSummary = (overview: GameOverviewMock): OverviewData => {
      const summaryBase = overview.summaryJa ?? overview.summaryEn ?? "概要情報は未掲載です。";
      return {
        name: overview.name,
        summary: summaryBase,
        genres: overview.genres ?? [],
      };
    };

    const fetchOverview = async () => {
      try {
        const igdbResponse = await fetch(`/api/igdb/${gameId}`, { cache: "no-store" });
        if (igdbResponse.ok) {
          const igdbData = (await igdbResponse.json()) as GameDetailResponse;
          if (!cancelled) {
            setData({
              name: igdbData.name,
              summary: igdbData.summary ?? "概要情報は未掲載です。",
              genres: igdbData.genres,
            });
            return;
          }
        }
      } catch (error) {
        console.error("Failed to fetch IGDB overview", error);
      }

      try {
        const mockResponse = await fetch(`/api/mocks/${gameId}`, { cache: "no-store" });
        if (mockResponse.ok) {
          const mock = (await mockResponse.json()) as GameOverviewMock;
          if (!cancelled) {
            setData(resolveSummary(mock));
            return;
          }
        }
      } catch (error) {
        console.error("Failed to fetch mock overview", error);
      }

      if (!cancelled) {
        setData(null);
      }
    };

    void fetchOverview().finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  // ローディング中はスケルトンUIを表示
  if (loading) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="xl">
        <Skeleton height="28px" mb={3} /> {/* タイトル用のスケルトン */}
        <SkeletonText noOfLines={3} /> {/* 概要文用のスケルトン */}
      </Box>
    );
  }

  // データが取得できない場合はエラーメッセージを表示
  if (!data) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="xl">
        <Heading size="md" mb={2}>
          概要
        </Heading>
        <Text color="gray.500">モックデータが見つかりません。</Text>
      </Box>
    );
  }

  // 概要文を優先順位で選択（日本語 → 英語 → デフォルトメッセージ）
  const summary = data.summary;

  // ゲームデータを表示
  const genres = data.genres ?? [];
  const hasGenres = genres.length > 0;

return (
  <Box p={4} borderWidth="1px" borderRadius="xl">
    {/* ゲームタイトル */}
    <Heading size="md" mb={2}>
      {data.name}
    </Heading>

    {/* ゲーム概要（改行を保持して表示） */}
    <Text whiteSpace="pre-wrap" lineHeight={1.8}>
      {summary}
    </Text>

    {/* ジャンル一覧（存在する場合のみ表示） */}
    {hasGenres && (
      <HStack mt={3} spacing={2} wrap="wrap">
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
