"use client"
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Stack, Heading } from "@chakra-ui/react";
import SearchWithResults from "@/components/organisms/search/SearchWithResults";
import HorizontalGameList from "@/components/organisms/game/HorizontalGameList";
import { Game } from "@/types/game";

/**
 * トップページ
 * 検索機能と横スクロールゲームリストを統合
 */
const HomePage: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ダミーゲームデータ（10件）
  const dummyGames: Game[] = [
    { id: '1', title: 'ゼルダの伝説 ティアーズ オブ ザ キングダム', categories: ['アクション', 'RPG'] },
    { id: '2', title: 'スプラトゥーン3', categories: ['シューティング'] },
    { id: '3', title: 'マリオカート8 デラックス', categories: ['スポーツ'] },
    { id: '4', title: 'ぷよぷよテトリス2', categories: ['パズル'] },
    { id: '5', title: 'ベヨネッタ3', categories: ['アクション'] },
    { id: '6', title: 'ポケットモンスター スカーレット', categories: ['RPG'] },
    { id: '7', title: 'スーパーマリオブラザーズ ワンダー', categories: ['アクション'] },
    { id: '8', title: 'ピクミン4', categories: ['アクション', 'パズル'] },
    { id: '9', title: 'ファイアーエムブレム エンゲージ', categories: ['RPG'] },
    { id: '10', title: 'カービィのグルメフェス', categories: ['アクション'] },
  ];

  /**
   * ゲームクリック時の処理
   */
  const handleGameClick = useCallback((gameId: string) => {
    router.push(`/game/${gameId}`);
  }, [router]);

  /**
   * 再試行処理
   */
  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    // シミュレーション用の遅延
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Container maxW="90%" py={8}>
        <Stack direction="column" gap={12}>
          {/* ページタイトル */}
          <Heading 
            as="h1" 
            fontSize={{ base: "3xl", md: "5xl" }} 
            textAlign="center" 
            color="white"
            fontWeight="bold"
          >
            GameReview Hub
          </Heading>

          {/* 検索セクション */}
          <SearchWithResults games={dummyGames} />

          {/* 新作ゲームセクション */}
          <HorizontalGameList
            title="新作ゲーム"
            games={dummyGames}
            onGameClick={handleGameClick}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
          />

          {/* 人気ゲームセクション */}
          <HorizontalGameList
            title="人気ゲーム"
            games={[...dummyGames].reverse()}
            onGameClick={handleGameClick}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
          />

          {/* おすすめゲームセクション */}
          <HorizontalGameList
            title="おすすめゲーム"
            games={dummyGames.slice(0, 5)}
            onGameClick={handleGameClick}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default HomePage;
