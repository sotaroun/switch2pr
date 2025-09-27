"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Image, Spinner, Box, VStack, Text } from "@chakra-ui/react";

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
  const fetchCoverImage = useCallback(async () => {
    try {
      setIsLoading(true);
      // ====== ここがモック部分 ======
      // APIを呼ぶ代わりに setTimeout で1秒後に仮データをセット
      const timer = setTimeout(() => {
        const mockData = [
          {
            name: "abe Game",
            cover: { url: "https://picsum.photos/300/200" }, // ランダム画像
          },
        ];

        const url = mockData[0]?.cover?.url ?? null;
        setCoverImageUrl(url); // 仮のURLをstateにセット
        setIsLoading(false); // ローディング完了
      }, 1000);
      // ====== ここまで ======

      return () => clearTimeout(timer); // クリーンアップ
    } catch (error) {
      console.error("Error fetching cover image:", error);
      setIsLoading(false);
    }
  }, []);

  // コンポーネントが表示された後の処理（gameIdが変更された時に画像を取得）
  useEffect(() => {
　　if (!gameId) {return;}
    fetchCoverImage();
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
