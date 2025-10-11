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
  Button,
} from "@chakra-ui/react";

type GameReviewMocks = {
  youtube?: Array<{ user: string; comment: string; title: string; channel: string }>;
  oneliner?: Array<{
    user: string;
    comment: string;
    rating: number;
    postedAt?: string;
    helpful?: number;
    status?: string;
  }>;
};

// ゲーム概要データの型定義（APIレスポンスと一致）
type GameOverview = {
  id: number;
  name: string;
  summaryJa?: string | null; // 日本語の概要（優先表示）
  summaryEn?: string | null; // 英語の概要（フォールバック）
  genres?: string[]; // ジャンル一覧
  reviews?: GameReviewMocks; // 口コミモック（他コンポーネントから利用）
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
  const [data, setData] = useState<GameOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false); // 説明文の展開状態

  // ゲームIDが変更された時にAPIからデータを取得
  useEffect(() => {
    // ゲームIDがない場合は早期リターン
    if (!gameId) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    // 擬似的に1秒遅延→API待ちの演出（任意）
    const t = setTimeout(() => {
      // モックAPIからゲームデータを取得
      fetch(`/api/mocks/${gameId}`)
        .then((r) => (r.ok ? r.json() : null)) // レスポンスが正常ならJSON、そうでなければnull
        .then((json) => setData(json)) // 取得したデータをstateに設定
        .catch(() => setData(null)) // エラー時はnullを設定
        .finally(() => setLoading(false)); // ローディング状態を終了
    }, 1000);

    // クリーンアップ関数（タイマーをクリア）
    return () => clearTimeout(t);
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
  const summary = data.summaryJa ?? data.summaryEn ?? "概要情報は未掲載です。";

  // 説明文を3行に制限する処理
  const shouldTruncate = summary.length > 100; // 大体3行分の文字数
  const displaySummary =
    isExpanded || !shouldTruncate ? summary : summary.substring(0, 100) + "...";

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
