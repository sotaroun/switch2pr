"use client"
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Stack, Heading } from "@chakra-ui/react";
import SearchWithResults from "@/components/organisms/search/SearchWithResults";
import HorizontalGameList from "@/components/organisms/game/HorizontalGameList";
import OverlayComments from "@/components/organisms/CommentSection/OverlayComments";
import { fetchOverlayCommentsAPI } from "@/lib/overlayComments";
import { prefetchGameOverview } from "@/lib/api/gameOverview";
import { Game } from "@/types/game";
import type { OverlayComment, FloatingComment } from "@/types/overlayComment";

type ManufacturerConfig = {
  id: string;
  label: string;
  companies: string[];
};

type ManufacturerState = {
  items: Game[];
  loading: boolean;
  hasMore: boolean;
  offset: number;
  initialized: boolean;
  error: string | null;
};

const MANUFACTURER_PAGE_SIZE = 30;

const MANUFACTURER_CONFIGS: ManufacturerConfig[] = [
  {
    id: "nintendo",
    label: "任天堂",
    companies: [
      "Nintendo",
      "Nintendo EPD",
      "Nintendo EPD Production Group No. 9",
      "Nintendo Co., Ltd.",
    ],
  },
  {
    id: "square-enix",
    label: "スクウェア・エニックス",
    companies: [
      "Square Enix",
      "Square Enix Holdings",
      "Square Co., Ltd.",
    ],
  },
  {
    id: "capcom",
    label: "カプコン",
    companies: [
      "Capcom",
      "Capcom Co., Ltd.",
    ],
  },
  {
    id: "bandai-namco",
    label: "バンダイナムコ",
    companies: [
      "Bandai Namco Entertainment",
      "BANDAI NAMCO Studios",
      "Namco Bandai Games",
    ],
  },
];

const MAX_FLOATING_COMMENTS = 10;
const PREFETCH_COMMENT_LIMIT = 12;

type ManufacturerSectionProps = {
  config: ManufacturerConfig;
  state: ManufacturerState;
  attachRef: (id: string, element: HTMLDivElement | null) => void;
  onGameClick: (gameId: string) => void;
  onGameHover: (gameId: string) => void;
  onGameLeave: () => void;
  onLoadMore: (config: ManufacturerConfig) => void;
  onRetry: (config: ManufacturerConfig) => void;
};

const ManufacturerSection: React.FC<ManufacturerSectionProps> = React.memo(
  ({
    config,
    state,
    attachRef,
    onGameClick,
    onGameHover,
    onGameLeave,
    onLoadMore,
    onRetry,
  }) => {
    const handleLoadMore = useCallback(() => {
      onLoadMore(config);
    }, [config, onLoadMore]);

    const handleRetry = useCallback(() => {
      onRetry(config);
    }, [config, onRetry]);

    return (
      <Box
        ref={(element) => attachRef(config.id, element)}
        data-manufacturer-id={config.id}
      >
        <HorizontalGameList
          title={`${config.label}の新着ゲーム`}
          games={state.items}
          onGameClick={onGameClick}
          onGameHover={onGameHover}
          onGameLeave={onGameLeave}
          isLoading={state.loading && !state.initialized}
          hasMore={state.hasMore}
          isLoadingMore={state.loading && state.initialized}
          onLoadMore={state.hasMore ? handleLoadMore : undefined}
          error={state.error ?? undefined}
          onRetry={handleRetry}
          emptyMessage={`${config.label}の新しいゲームが見つかりません`}
        />
      </Box>
    );
  }
);

ManufacturerSection.displayName = "ManufacturerSection";

/**
 * トップページ
 * 検索機能と横スクロールゲームリストを統合
 */
const HomePage: React.FC = () => {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGamesLoading, setIsGamesLoading] = useState(true);
  const [hoveredGameId, setHoveredGameId] = useState<string | null>(null);
  const commentsCacheRef = useRef<Record<string, OverlayComment[]>>({});
  const [floatingComments, setFloatingComments] = useState<FloatingComment[]>([]);
  const scheduledTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const manufacturerConfigs = useMemo(() => MANUFACTURER_CONFIGS, []);
  const manufacturerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const prefetchedGameRoutesRef = useRef<Set<string>>(new Set());
  const [manufacturerStates, setManufacturerStates] = useState<Record<string, ManufacturerState>>(() =>
    manufacturerConfigs.reduce((acc, config) => {
      acc[config.id] = {
        items: [],
        loading: false,
        hasMore: true,
        offset: 0,
        initialized: false,
        error: null,
      };
      return acc;
    }, {} as Record<string, ManufacturerState>)
  );
  const manufacturerStatesRef = useRef(manufacturerStates);
  useEffect(() => {
    manufacturerStatesRef.current = manufacturerStates;
  }, [manufacturerStates]);

  // 管理画面で非表示にされていないものだけをホーム表示対象にする。
  const homeGames = useMemo(() => {
    const filtered = games.filter((game) => game.visibleOnHome !== false);
    return filtered.length > 0 ? filtered : games;
  }, [games]);

  const combinedManufacturerGames = useMemo(() => {
    const seen = new Set<string>();
    const aggregated: Game[] = [];
    manufacturerConfigs.forEach((config) => {
      const state = manufacturerStates[config.id];
      if (!state) return;
      state.items.forEach((game) => {
        if (seen.has(game.id)) return;
        seen.add(game.id);
        aggregated.push(game);
      });
    });
    return aggregated
      .slice()
      .sort((a, b) => (b.firstReleaseDate ?? 0) - (a.firstReleaseDate ?? 0));
  }, [manufacturerConfigs, manufacturerStates]);

  const newReleaseGames = useMemo(() => {
    if (combinedManufacturerGames.length > 0) {
      return combinedManufacturerGames;
    }
    return games.filter((game) => game.featuredNewRelease);
  }, [combinedManufacturerGames, games]);

  const manufacturerLoading = useMemo(
    () =>
      manufacturerConfigs.some((config) => {
        const state = manufacturerStates[config.id];
        return state ? state.loading && !state.initialized : false;
      }),
    [manufacturerConfigs, manufacturerStates]
  );

  const manufacturerError = useMemo(() => {
    if (combinedManufacturerGames.length > 0) {
      return null;
    }
    const hasError = manufacturerConfigs.some((config) => {
      const state = manufacturerStates[config.id];
      return Boolean(state?.error);
    });
    return hasError ? "メーカー別の新作取得に失敗しました" : null;
  }, [combinedManufacturerGames, manufacturerConfigs, manufacturerStates]);

  // おすすめは管理画面でのフラグだけを頼りにする。
  const recommendedGames = useMemo(
    () => games.filter((game) => game.featuredRecommended),
    [games]
  );

  // ハイライトの追加ロード時に重複を避けるための helper。
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

  const updateManufacturerState = useCallback(
    (id: string, updater: (current: ManufacturerState) => ManufacturerState) => {
      setManufacturerStates((prev) => ({
        ...prev,
        [id]: updater(prev[id]),
      }));
    },
    []
  );

  // /api/games は Supabase + IGDB の合成結果。初期表示と fallback 双方を考慮している。
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
      setGames(data);
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
    } finally {
      setIsGamesLoading(false);
    }
  }, []);

  const fetchManufacturerInitial = useCallback(
    async (config: ManufacturerConfig) => {
      const current = manufacturerStatesRef.current[config.id];
      if (current?.loading || current?.initialized) return;

      updateManufacturerState(config.id, (state) => ({
        ...state,
        loading: true,
        error: null,
      }));

      const params = new URLSearchParams();
      params.set("offset", "0");
      config.companies.forEach((name) => params.append("company", name));

      try {
        const response = await fetch(`/api/games/highlights?${params.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch manufacturer highlights: ${response.status}`);
        }
        const data = (await response.json()) as { items?: Game[]; hasMore?: boolean };
        const items = data.items ?? [];

        updateManufacturerState(config.id, (state) => ({
          ...state,
          items,
          hasMore: data.hasMore ?? items.length >= MANUFACTURER_PAGE_SIZE,
          offset: items.length,
          initialized: true,
          loading: false,
          error: null,
        }));
      } catch (err) {
        console.error(`メーカー別ハイライトの取得に失敗しました (${config.id})`, err);
        updateManufacturerState(config.id, (state) => ({
          ...state,
          loading: false,
          error: "ハイライトの取得に失敗しました",
        }));
      }
    },
    [updateManufacturerState]
  );

  const loadMoreManufacturer = useCallback(
    async (config: ManufacturerConfig) => {
      const current = manufacturerStatesRef.current[config.id];
      if (!current || current.loading || !current.hasMore) return;

      updateManufacturerState(config.id, (state) => ({
        ...state,
        loading: true,
        error: null,
      }));

      const params = new URLSearchParams();
      params.set("offset", String(current.offset));
      config.companies.forEach((name) => params.append("company", name));

      try {
        const response = await fetch(`/api/games/highlights?${params.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch more manufacturer games: ${response.status}`);
        }
        const data = (await response.json()) as { items?: Game[]; hasMore?: boolean };
        const items = data.items ?? [];

        updateManufacturerState(config.id, (state) => ({
          ...state,
          items: mergeUniqueGames(state.items, items),
          hasMore: data.hasMore ?? items.length >= MANUFACTURER_PAGE_SIZE,
          offset: state.offset + items.length,
          initialized: true,
          loading: false,
          error: null,
        }));
      } catch (err) {
        console.error(`メーカー別ハイライトの追加取得に失敗しました (${config.id})`, err);
        updateManufacturerState(config.id, (state) => ({
          ...state,
          loading: false,
          error: "ハイライトの取得に失敗しました",
        }));
      }
    },
    [mergeUniqueGames, updateManufacturerState]
  );

  const observeManufacturers = useCallback(() => {
    const observer = observerRef.current;
    if (!observer) return;
    manufacturerConfigs.forEach((config, index) => {
      if (index === 0) return;
      const element = manufacturerRefs.current[config.id];
      if (!element) return;
      const state = manufacturerStatesRef.current[config.id];
      if (state?.initialized || state?.loading) {
        observer.unobserve(element);
        return;
      }
      observer.observe(element);
    });
  }, [manufacturerConfigs]);

  const attachManufacturerRef = useCallback(
    (id: string, element: HTMLDivElement | null) => {
      if (element) {
        manufacturerRefs.current[id] = element;
        element.setAttribute("data-manufacturer-id", id);
        observeManufacturers();
      } else {
        delete manufacturerRefs.current[id];
      }
    },
    [observeManufacturers]
  );

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

  // 初回レンダリングでゲーム一覧を取得。
  // コメントを事前取得するためのプリフェッチロジック。
  // ホバー中のゲームがあれば浮遊コメントを差し替える。
  useEffect(() => {
    const controller = new AbortController();
    void fetchGames(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchGames]);

  useEffect(() => {
    if (manufacturerConfigs.length === 0) {
      return;
    }
    const firstConfig = manufacturerConfigs[0];
    void fetchManufacturerInitial(firstConfig);
  }, [manufacturerConfigs, fetchManufacturerInitial]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      manufacturerConfigs.slice(1).forEach((config) => {
        void fetchManufacturerInitial(config);
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("data-manufacturer-id");
          if (!id) return;
          const config = manufacturerConfigs.find((item) => item.id === id);
          if (!config) return;
          const state = manufacturerStatesRef.current[id];
          if (state?.initialized || state?.loading) {
            observer.unobserve(entry.target);
            return;
          }
          void fetchManufacturerInitial(config);
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    observerRef.current = observer;
    observeManufacturers();

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [fetchManufacturerInitial, manufacturerConfigs, observeManufacturers]);

  useEffect(() => {
    observeManufacturers();
  }, [manufacturerConfigs, observeManufacturers, manufacturerStates]);

  useEffect(() => {
    if (games.length === 0) {
      return;
    }

    let cancelled = false;
    const targets = games.slice(0, PREFETCH_COMMENT_LIMIT);

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

const handleGameHover = useCallback((gameId: string) => {
  setHoveredGameId((prev) => (prev === gameId ? prev : gameId));
  const route = `/game/${gameId}`;
  if (!prefetchedGameRoutesRef.current.has(route)) {
    prefetchedGameRoutesRef.current.add(route);
    try {
      router.prefetch(route);
    } catch (error) {
      console.warn("Failed to prefetch route", route, error);
      prefetchedGameRoutesRef.current.delete(route);
    }
  }
  void prefetchGameOverview(gameId);
}, [router]);

const handleGameLeave = useCallback(() => {
  setHoveredGameId((prev) => (prev === null ? prev : null));
}, []);

  /**
   * 再試行処理
   */
  const handleRetry = useCallback(() => {
    setError(null);
    void fetchGames();
    const firstConfig = manufacturerConfigs[0];
    if (firstConfig) {
      void fetchManufacturerInitial(firstConfig);
    }
  }, [fetchGames, fetchManufacturerInitial, manufacturerConfigs]);

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
    const maxComments = Math.min(comments.length, MAX_FLOATING_COMMENTS);
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

  // 画面構成: ヘッダー -> 検索 -> おすすめ -> 新作 -> メーカー別 -> 浮遊コメント。
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

          {/* おすすめゲームセクション */}
          <HorizontalGameList
            title="おすすめゲーム"
            games={recommendedGames}
            onGameClick={handleGameClick}
            onGameHover={handleGameHover}
            onGameLeave={handleGameLeave}
            isLoading={isGamesLoading}
            error={error}
            onRetry={handleRetry}
            emptyMessage="おすすめに設定されたゲームがありません"
          />

          {/* 新作ゲームセクション */}
          <HorizontalGameList
            title="新作ゲーム"
            games={newReleaseGames}
            onGameClick={handleGameClick}
            onGameHover={handleGameHover}
            onGameLeave={handleGameLeave}
            isLoading={manufacturerLoading && newReleaseGames.length === 0}
            error={manufacturerError}
            onRetry={handleRetry}
            emptyMessage="表示できる新作ゲームがありません"
          />

          {manufacturerConfigs.map((config) => {
            const state = manufacturerStates[config.id];
            if (!state) return null;
            return (
              <ManufacturerSection
                key={config.id}
                config={config}
                state={state}
                attachRef={attachManufacturerRef}
                onGameClick={handleGameClick}
                onGameHover={handleGameHover}
                onGameLeave={handleGameLeave}
                onLoadMore={loadMoreManufacturer}
                onRetry={fetchManufacturerInitial}
              />
            );
          })}
        </Stack>
      </Container>
      <OverlayComments comments={floatingComments} totalLanes={20} />
    </Box>
  );
};

export default HomePage;
