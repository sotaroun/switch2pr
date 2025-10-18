"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Image, Spinner, Box, VStack, Text } from "@chakra-ui/react";

import type { GameDetailResponse } from "@/types/game-detail";

// ゲーム詳細ページのサムネ画像を表示するコンポーネント
// chakraUIを使用する
// IGDB APIを使用する
// ゲームのIDを受け取って、ゲームのサムネ画像を表示する
// ゲームのIDは、ゲーム詳細ページのURLから取得する
// ゲームのサムネ画像は、IGDB APIから取得する
// ゲームのサムネ画像は、ゲーム詳細ページのURLから取得する

export const GameImage: React.FC = () => {
  const params = useParams();
  const id = params.id;

  // idが文字列でない場合の処理（Next.jsのparams.idは string | string[] になる可能性があるため）
  const gameId = typeof id === "string" ? id : null;
  // ゲーム画像のURLを保存するstate（初期値はnull）
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // fetchCoverImage関数をメモ化（パフォーマンス向上とuseEffectの無限ループ防止のため）
  const fetchGameDetail = useCallback(async (): Promise<GameDetailResponse | null> => {
    if (!gameId) {
      return null;
    }

    try {
      const response = await fetch(`/api/igdb/${gameId}`, { cache: "no-store" });
      if (response.ok) {
        const json = (await response.json()) as GameDetailResponse;
        return json;
      }
    } catch (error) {
      console.error("Failed to fetch IGDB game detail", error);
    }
    return null;
  }, [gameId]);

  const fetchCoverImage = useCallback(async () => {
    if (!gameId) {
      setCoverImageUrl(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const detail = await fetchGameDetail();
      setCoverImageUrl(detail?.coverUrl ?? null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchGameDetail, gameId]);

  // コンポーネントが表示された後の処理（gameIdが変更された時に画像を取得）
  useEffect(() => {
    if (!gameId) {
      return;
    }
    void fetchCoverImage();
  }, [gameId, fetchCoverImage]);

  // 画面で表示させる部分
  if (isLoading) {
    return (
      <VStack colorPalette="teal">
        <Spinner color="colorPalette.600" />
        <Text color="colorPalette.600">Loading...</Text>
      </VStack>
    );
  }
  if (!coverImageUrl) {return <Box>No image</Box>; }// 画像がない場合はメッセージを表示
  return (
    <Image
      src={coverImageUrl}
      alt="Game cover"
      htmlWidth="400px"
      htmlHeight="300px"
      borderRadius="lg"
    />
  );
};
