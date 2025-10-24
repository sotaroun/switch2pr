"use client"
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Stack, Heading } from "@chakra-ui/react";
import SearchWithResults from "@/components/organisms/search/SearchWithResults";
import HorizontalGameList from "@/components/organisms/game/HorizontalGameList";
import OverlayComments from "@/components/organisms/CommentSection/OverlayComments";
import { fetchOverlayCommentsAPI } from "@/lib/overlayComments";
import { Game } from "@/types/game";
import type { OverlayComment, FloatingComment } from "@/types/overlayComment";

const FALLBACK_GAMES: Game[] = [
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
 * トップページ
 * 検索機能と横スクロールゲームリストを統合
 */
const HomePage: React.FC = () => {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>(FALLBACK_GAMES);
  const [error, setError] = useState<string | null>(null);
  const [isGamesLoading, setIsGamesLoading] = useState(true);
  const [hoveredGameId, setHoveredGameId] = useState<string | null>(null);
  const commentsCacheRef = useRef<Record<string, OverlayComment[]>>({});
  const [floatingComments, setFloatingComments] = useState<FloatingComment[]>([]);
  const scheduledTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const fetchGames = useCallback(async (signal?: AbortSignal) => {
    setIsGamesLoading(true);
    try {
      const response = await fetch("/api/games", {
        signal,
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.status}`);
      }
      const data = (await response.json()) as Game[];
      setGames(data.length > 0 ? data : FALLBACK_GAMES);
      setError(null);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        return;
      }
      if ((err as Error)?.name === "AbortError") {
        return;
      }
      console.error("ゲーム一覧の取得に失敗しました", err);
      setError("ゲーム情報の取得に失敗しました。");
      setGames(FALLBACK_GAMES);
    } finally {
      setIsGamesLoading(false);
    }
  }, []);

  const fetchComments = useCallback(async (gameId: string) => {
    const cached = commentsCacheRef.current[gameId];
    if (cached) {
      return cached;
    }

    const comments = await fetchOverlayCommentsAPI(gameId);
    commentsCacheRef.current = {
      ...commentsCacheRef.current,
      [gameId]: comments,
    };
    return comments;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchGames(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchGames]);

  useEffect(() => {
    if (games.length === 0) {
      return;
    }

    let cancelled = false;
    const targets = games.slice(0, 24);

    (async () => {
      for (const game of targets) {
        if (cancelled) break;
        if (commentsCacheRef.current[game.id]) continue;

        try {
          await fetchComments(game.id);
          if (cancelled) break;
        } catch (error) {
          console.warn("コメントの事前取得に失敗しました", error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [games, fetchComments]);

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
    void fetchGames();
  }, [fetchGames]);

  const clearScheduledComments = useCallback(() => {
    scheduledTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    scheduledTimeoutsRef.current = [];
    setFloatingComments([]);
  }, []);

  const scheduleComments = useCallback((comments: OverlayComment[]) => {
    clearScheduledComments();
    if (comments.length === 0) {
      console.log("[overlay] コメントが存在しません");
      return;
    }


    const totalLanes = 20;
    const maxComments = Math.min(comments.length, 25);
    const floatingList: FloatingComment[] = [];
    const usedLanes = new Set<number>();

    for (let index = 0; index < maxComments; index++) {
      const baseComment = comments[index % comments.length];
      let lane = Math.floor(Math.random() * totalLanes);
      if (usedLanes.has(lane)) {
        lane = (lane + 1) % totalLanes;
      }
      usedLanes.add(lane);

      const charCount = baseComment.content.length;
      const duration = Math.max(6, Math.min(18, charCount * 0.2 + 8));
      const fontSize = 16 + Math.floor(Math.random() * 8);
      const key = `${baseComment.id}-${lane}-${index}-${Date.now()}`;
      const delay = 0;

      floatingList.push({
        id: baseComment.id,
        content: baseComment.content,
        createdAt: baseComment.createdAt,
        lane,
        duration,
        fontSize,
        key,
        delay,
      });
    }

    setFloatingComments(floatingList);

    floatingList.forEach((item) => {
      const timeout = setTimeout(() => {
        setFloatingComments((prev) => prev.filter((comment) => comment.key !== item.key));
      }, (item.delay + item.duration) * 1000);
      scheduledTimeoutsRef.current.push(timeout);
    });
  }, [clearScheduledComments]);

  useEffect(() => {
    if (!hoveredGameId) {
      clearScheduledComments();
      return;
    }

    let cancelled = false;

    (async () => {
      const comments = await fetchComments(hoveredGameId);
      if (cancelled) return;
      scheduleComments(comments);
    })();

    return () => {
      cancelled = true;
      clearScheduledComments();
    };
  }, [hoveredGameId, fetchComments, scheduleComments, clearScheduledComments]);

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
          <SearchWithResults games={games} />

          {/* 新作ゲームセクション */}
          <HorizontalGameList
            title="新作ゲーム"
            games={games}
            onGameClick={handleGameClick}
            onGameHover={(gameId) => {
              setHoveredGameId((prev) => (prev === gameId ? prev : gameId));
            }}
            onGameLeave={() => setHoveredGameId((prev) => (prev === null ? prev : null))}
            isLoading={isGamesLoading}
            error={error}
            onRetry={handleRetry}
          />

          {/* 人気ゲームセクション */}
          <HorizontalGameList
            title="人気ゲーム"
            games={[...games].reverse()}
            onGameClick={handleGameClick}
            onGameHover={(gameId) => {
              setHoveredGameId((prev) => (prev === gameId ? prev : gameId));
            }}
            onGameLeave={() => setHoveredGameId((prev) => (prev === null ? prev : null))}
            isLoading={isGamesLoading}
            error={error}
            onRetry={handleRetry}
          />

          {/* おすすめゲームセクション */}
          <HorizontalGameList
            title="おすすめゲーム"
            games={games.slice(0, 5)}
            onGameClick={handleGameClick}
            onGameHover={(gameId) => {
              setHoveredGameId((prev) => (prev === gameId ? prev : gameId));
            }}
            onGameLeave={() => setHoveredGameId((prev) => (prev === null ? prev : null))}
            isLoading={isGamesLoading}
            error={error}
            onRetry={handleRetry}
          />
        </Stack>
      </Container>
      <OverlayComments comments={floatingComments} totalLanes={20} />
    </Box>
  );
};

export default HomePage;
