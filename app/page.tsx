"use client"
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Stack, Heading } from "@chakra-ui/react";
import SearchWithResults from "@/components/organisms/search/SearchWithResults";
import HorizontalGameList from "@/components/organisms/game/HorizontalGameList";
import OverlayComments from "@/components/organisms/CommentSection/OverlayComments";
import { fetchOverlayCommentsAPI } from "@/lib/overlayComments";
import { Game } from "@/types/game";
import type { OverlayComment, FloatingComment } from "@/types/overlayComment";
import { Header } from "@/components/organisms/Header/Header";
import { headerMenus } from "@/datas/headerData";
import { Metadata } from "next";

const FALLBACK_GAMES: Game[] = [
  { id: '1', title: 'ゼルダの伝説 ティアーズ オブ ザ キングダム', categories: ['アクション', 'RPG'] },
  { id: '2', title: 'スプラトゥーン3', categories: ['シューター'] },
  { id: '3', title: 'マリオカート8 デラックス', categories: ['スポーツ'] },
  { id: '4', title: 'ぷよぷよテトリス2', categories: ['パズル'] },
  { id: '5', title: 'ベヨネッタ3', categories: ['アクション'] },
  { id: '6', title: 'ポケットモンスター スカーレット', categories: ['RPG'] },
  { id: '7', title: 'スーパーマリオブラザーズ ワンダー', categories: ['アクション'] },
  { id: '8', title: 'ピクミン4', categories: ['アクション', 'パズル'] },
  { id: '9', title: 'ファイアーエムブレム エンゲージ', categories: ['RPG'] },
  { id: '10', title: 'カービィのグルメフェス', categories: ['アクション'] },
];

const HIGHLIGHT_PAGE_SIZE = 30;

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
  const [newReleaseHighlights, setNewReleaseHighlights] = useState<Game[]>([]);
  const [newReleaseHasMore, setNewReleaseHasMore] = useState(true);
  const [newReleaseLoading, setNewReleaseLoading] = useState(false);
  const [newReleaseInitialized, setNewReleaseInitialized] = useState(false);
  const newReleaseOffsetRef = useRef(0);
  const [popularHighlights, setPopularHighlights] = useState<Game[]>([]);
  const [popularHasMore, setPopularHasMore] = useState(true);
  const [popularLoading, setPopularLoading] = useState(false);
  const [popularInitialized, setPopularInitialized] = useState(false);
  const popularOffsetRef = useRef(0);
  const [highlightError, setHighlightError] = useState<string | null>(null);

  const homeGames = useMemo(() => {
    const filtered = games.filter((game) => game.visibleOnHome !== false);
    return filtered.length > 0 ? filtered : games;
  }, [games]);

  const newReleaseGames = useMemo(() => {
    if (newReleaseHighlights.length > 0) {
      return newReleaseHighlights;
    }
    const flagged = games.filter((game) => game.featuredNewRelease);
    if (flagged.length > 0) {
      return flagged;
    }
    return homeGames;
  }, [games, homeGames, newReleaseHighlights]);

  const popularGames = useMemo(() => {
    if (popularHighlights.length > 0) {
      return popularHighlights;
    }
    const flagged = games.filter((game) => game.featuredPopular);
    if (flagged.length > 0) {
      return flagged;
    }
    return [...homeGames].reverse();
  }, [games, homeGames, popularHighlights]);

  const recommendedGames = useMemo(
    () => games.filter((game) => game.featuredRecommended),
    [games]
  );

  const mergeUniqueGames = useCallback((current: Game[], incoming: Game[]) => {
    if (incoming.length === 0) return current;
    const seen = new Set(current.map((game) => game.id));
    const appended = incoming.filter((game) => {
      if (seen.has(game.id)) return false;
      seen.add(game.id);
      return true;
    });
    if (appended.length === 0) return current;
    return [...current, ...appended];
  }, []);

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

  const fetchHighlights = useCallback(async (signal?: AbortSignal) => {
    setNewReleaseLoading(true);
    setPopularLoading(true);
    setHighlightError(null);
    let aborted = false;
    try {
      const response = await fetch("/api/games/highlights", {
        signal,
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch highlights: ${response.status}`);
      }
      const data = (await response.json()) as {
        newReleases?: Game[];
        popular?: Game[];
        newHasMore?: boolean;
        popularHasMore?: boolean;
      };
      if (signal?.aborted) {
        aborted = true;
        return;
      }
      const newItems = data.newReleases ?? [];
      const popularItems = data.popular ?? [];

      setNewReleaseHighlights(newItems);
      setPopularHighlights(popularItems);

      newReleaseOffsetRef.current = newItems.length;
      popularOffsetRef.current = popularItems.length;

      setNewReleaseHasMore(
        data.newHasMore ?? newItems.length >= HIGHLIGHT_PAGE_SIZE
      );
      setPopularHasMore(
        data.popularHasMore ?? popularItems.length >= HIGHLIGHT_PAGE_SIZE
      );
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        aborted = true;
        return;
      }
      console.error("ハイライトの取得に失敗しました", err);
      setNewReleaseHighlights([]);
      setPopularHighlights([]);
      setNewReleaseHasMore(false);
      setPopularHasMore(false);
      setHighlightError("ハイライトの取得に失敗しました。");
    } finally {
      if (!aborted) {
        setNewReleaseInitialized(true);
        setPopularInitialized(true);
      }
      setNewReleaseLoading(false);
      setPopularLoading(false);
    }
  }, []);

  const loadMoreNewReleases = useCallback(async () => {
    if (newReleaseLoading || !newReleaseInitialized || !newReleaseHasMore) return;
    setNewReleaseLoading(true);
    try {
      const offset = newReleaseOffsetRef.current;
      const response = await fetch(`/api/games/highlights?category=new&offset=${offset}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch more new releases: ${response.status}`);
      }
      const data = (await response.json()) as { items?: Game[]; hasMore?: boolean };
      const items = data.items ?? [];
      setNewReleaseHighlights((prev) => mergeUniqueGames(prev, items));
      newReleaseOffsetRef.current = offset + items.length;
      setNewReleaseHasMore(
        data.hasMore ?? items.length >= HIGHLIGHT_PAGE_SIZE
      );
    } catch (err) {
      console.error("追加の新作ゲーム取得に失敗しました", err);
    } finally {
      setNewReleaseLoading(false);
      setNewReleaseInitialized(true);
    }
  }, [mergeUniqueGames, newReleaseHasMore, newReleaseInitialized, newReleaseLoading]);

  const loadMorePopular = useCallback(async () => {
    if (popularLoading || !popularInitialized || !popularHasMore) return;
    setPopularLoading(true);
    try {
      const offset = popularOffsetRef.current;
      const response = await fetch(`/api/games/highlights?category=popular&offset=${offset}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch more popular games: ${response.status}`);
      }
      const data = (await response.json()) as { items?: Game[]; hasMore?: boolean };
      const items = data.items ?? [];
      setPopularHighlights((prev) => mergeUniqueGames(prev, items));
      popularOffsetRef.current = offset + items.length;
      setPopularHasMore(
        data.hasMore ?? items.length >= HIGHLIGHT_PAGE_SIZE
      );
    } catch (err) {
      console.error("追加の人気ゲーム取得に失敗しました", err);
    } finally {
      setPopularLoading(false);
      setPopularInitialized(true);
    }
  }, [mergeUniqueGames, popularHasMore, popularInitialized, popularLoading]);

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
    void Promise.all([fetchGames(controller.signal), fetchHighlights(controller.signal)]);
    return () => {
      controller.abort();
    };
  }, [fetchGames, fetchHighlights]);

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
    void Promise.all([fetchGames(), fetchHighlights()]);
  }, [fetchGames, fetchHighlights]);

  const clearScheduledComments = useCallback(() => {
    scheduledTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    scheduledTimeoutsRef.current = [];
    setFloatingComments([]);
  }, []);

  const scheduleComments = useCallback((comments: OverlayComment[]) => {
    clearScheduledComments();
    if (comments.length === 0) {
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
          <SearchWithResults games={homeGames} />

          {/* 新作ゲームセクション */}
          <HorizontalGameList
            title="新作ゲーム"
            games={newReleaseGames}
            onGameClick={handleGameClick}
            onGameHover={(gameId) => {
              setHoveredGameId((prev) => (prev === gameId ? prev : gameId));
            }}
            onGameLeave={() => setHoveredGameId((prev) => (prev === null ? prev : null))}
            isLoading={newReleaseLoading && !newReleaseInitialized}
            hasMore={newReleaseHasMore}
            isLoadingMore={newReleaseLoading && newReleaseInitialized}
            onLoadMore={newReleaseHasMore ? loadMoreNewReleases : undefined}
            error={highlightError}
            onRetry={handleRetry}
          />

          {/* 人気ゲームセクション */}
          <HorizontalGameList
            title="人気ゲーム"
            games={popularGames}
            onGameClick={handleGameClick}
            onGameHover={(gameId) => {
              setHoveredGameId((prev) => (prev === gameId ? prev : gameId));
            }}
            onGameLeave={() => setHoveredGameId((prev) => (prev === null ? prev : null))}
            isLoading={popularLoading && !popularInitialized}
            hasMore={popularHasMore}
            isLoadingMore={popularLoading && popularInitialized}
            onLoadMore={popularHasMore ? loadMorePopular : undefined}
            error={highlightError}
            onRetry={handleRetry}
          />

          {/* おすすめゲームセクション */}
          <HorizontalGameList
            title="おすすめゲーム"
            games={recommendedGames}
            onGameClick={handleGameClick}
            onGameHover={(gameId) => {
              setHoveredGameId((prev) => (prev === gameId ? prev : gameId));
            }}
            onGameLeave={() => setHoveredGameId((prev) => (prev === null ? prev : null))}
            isLoading={isGamesLoading}
            error={error}
            onRetry={handleRetry}
            emptyMessage="おすすめに設定されたゲームがありません"
          />
        </Stack>
      </Container>
      <OverlayComments comments={floatingComments} totalLanes={20} />
    </Box>
  );
};

export default HomePage;
