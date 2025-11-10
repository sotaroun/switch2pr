"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Badge,
} from "@chakra-ui/react";
import { InputGroup } from "@/components/ui/input-group";
import { toaster } from "@/components/ui/toaster";
import { Check } from "lucide-react";
import { LuSearch } from "react-icons/lu";

import { useDebounce } from "@/hooks/useDebounce";
import type { Game } from "@/types/game";

type AdminGame = Game & {
  visibleOnHome: boolean;
  visibleOnCategory: boolean;
  featuredNewRelease: boolean;
  featuredPopular: boolean;
  featuredRecommended: boolean;
  sortOrder: number | null;
};

type HighlightState = {
  items: Game[];
  loading: boolean;
};

const cardStyles = {
  bg: "gray.700",
  borderRadius: "lg",
  borderWidth: "1px",
  borderColor: "gray.600",
  overflow: "hidden",
  boxShadow: "lg",
};

function GameGridCard({
  game,
  actionLabel,
  onAction,
  disabled,
  variant = "default",
  children,
}: {
  game: Game;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
  variant?: "default" | "recommended";
  children?: React.ReactNode;
}) {
  return (
    <Stack
      gap={3}
      {...cardStyles}
      p={3}
      transition="all 0.2s"
      _hover={{ borderColor: variant === "recommended" ? "teal.400" : "gray.600" }}
    >
      <Flex gap={3}>
        <Box position="relative" w="80px" h="110px" flexShrink={0} borderRadius="md" overflow="hidden" bg="gray.700">
          {game.iconUrl ? (
            <Image src={game.iconUrl} alt={game.title} fill style={{ objectFit: "cover" }} />
          ) : (
            <Flex align="center" justify="center" w="full" h="full" color="gray.400" fontSize="sm">
              No Image
            </Flex>
          )}
        </Box>
        <Stack gap={2} flex="1">
          <Stack gap={1}>
            <Text fontWeight="semibold" color="white" fontSize="lg" lineClamp={2}>
              {game.displayName ?? game.title}
            </Text>
            <HStack gap={2} flexWrap="wrap">
              {game.categories.slice(0, 3).map((category) => (
                <Badge key={category} size="sm" colorPalette="gray" variant="solid">
                  {category}
                </Badge>
              ))}
            </HStack>
          </Stack>
          {children}
        </Stack>
      </Flex>
      {actionLabel && onAction ? (
        <Button
          onClick={onAction}
          disabled={disabled}
          colorPalette={variant === "recommended" ? "pink" : "teal"}
          variant={variant === "recommended" ? "outline" : "solid"}
          size="sm"
        >
          {variant !== "recommended" && <Check size={16} />}
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  );
}

export default function AdminGamesPage() {
  const [adminGames, setAdminGames] = useState<Map<string, AdminGame>>(new Map());
  const [adminLoading, setAdminLoading] = useState(true);

  const [newReleaseState, setNewReleaseState] = useState<HighlightState>({ items: [], loading: true });
  const [popularState, setPopularState] = useState<HighlightState>({ items: [], loading: true });
  const [highlightError, setHighlightError] = useState<string | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const adminFetchAbortRef = useRef<AbortController | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 250);
  const normalizedSearch = useMemo(() => debouncedSearch.trim().toLowerCase(), [debouncedSearch]);

  const recommendedGames = useMemo(() => {
    return Array.from(adminGames.values()).filter((game) => game.featuredRecommended);
  }, [adminGames]);

  const matchesSearch = useCallback(
    (game: Game) => {
      if (!normalizedSearch) return true;
      const haystack = `${game.title} ${game.displayName ?? ""} ${game.id}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    },
    [normalizedSearch]
  );

  const filteredRecommendedGames = useMemo(
    () => recommendedGames.filter(matchesSearch),
    [matchesSearch, recommendedGames]
  );

  const filteredNewReleaseItems = useMemo(
    () => newReleaseState.items.filter(matchesSearch),
    [matchesSearch, newReleaseState.items]
  );

  const filteredPopularItems = useMemo(
    () => popularState.items.filter(matchesSearch),
    [matchesSearch, popularState.items]
  );

  const handleLookup = useCallback(async () => {
    const trimmed = normalizedSearch.trim();
    if (!trimmed) {
      toaster.create({ title: "検索ワードを入力してください", type: "warning" });
      return;
    }
    const igdbId = Number(trimmed);
    if (!Number.isInteger(igdbId) || igdbId <= 0) {
      toaster.create({ title: "IGDB ID を数値で入力してください", type: "warning" });
      return;
    }

    setAdminLoading(true);
    try {
      const response = await fetch(`/api/admin/games/lookup?igdbId=${igdbId}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        const message = error?.error === "not_found" ? "該当するゲームが見つかりません" : "IGDB からの取得に失敗しました";
        toaster.create({ title: message, type: "error" });
        return;
      }
      const { game } = (await response.json()) as { game: Game };
      setAdminGames((prev) => {
        const next = new Map(prev);
        const existing = next.get(game.id);
        next.set(game.id, {
          ...game,
          visibleOnHome: existing?.visibleOnHome ?? true,
          visibleOnCategory: existing?.visibleOnCategory ?? true,
          featuredNewRelease: existing?.featuredNewRelease ?? false,
          featuredPopular: existing?.featuredPopular ?? false,
          featuredRecommended: true,
          sortOrder: existing?.sortOrder ?? null,
        });
        return next;
      });
      setNewReleaseState((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== game.id),
      }));
      setPopularState((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== game.id),
      }));
      setSearchTerm("");
      toaster.create({ title: "IGDB から取得しました", type: "success" });
    } catch (error) {
      console.error(error);
      toaster.create({ title: "IGDB からの取得に失敗しました", type: "error" });
    } finally {
      setAdminLoading(false);
    }
  }, [normalizedSearch]);

  const fetchAdminGames = useCallback(async () => {
    if (adminFetchAbortRef.current) {
      adminFetchAbortRef.current.abort();
    }
    const controller = new AbortController();
    adminFetchAbortRef.current = controller;
    setAdminLoading(true);
    try {
      const response = await fetch("/api/admin/games", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`failed: ${response.status}`);
      }
      const json = (await response.json()) as { games: AdminGame[] };
      const next = new Map<string, AdminGame>();
      (json.games ?? []).forEach((game) => {
        next.set(game.id, game);
      });
      setAdminGames(next);
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      console.error(error);
      toaster.create({ title: "管理データの取得に失敗しました", type: "error" });
    } finally {
      setAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAdminGames();
    return () => {
      adminFetchAbortRef.current?.abort();
    };
  }, [fetchAdminGames]);

  const fetchHighlights = useCallback(async () => {
    setNewReleaseState((prev) => ({ ...prev, loading: true }));
    setPopularState((prev) => ({ ...prev, loading: true }));
    setHighlightError(null);
    try {
      const response = await fetch("/api/games/highlights", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`failed: ${response.status}`);
      }
      const data = (await response.json()) as {
        newReleases?: Game[];
        popular?: Game[];
      };
      setNewReleaseState({ items: data.newReleases ?? [], loading: false });
      setPopularState({ items: data.popular ?? [], loading: false });
    } catch (error) {
      console.error(error);
      setHighlightError("ハイライトの取得に失敗しました。");
      setNewReleaseState({ items: [], loading: false });
      setPopularState({ items: [], loading: false });
    }
  }, []);

  useEffect(() => {
    void fetchHighlights();
  }, [fetchHighlights]);

  const upsertRecommended = useCallback(
    async (game: Game, nextState: boolean) => {
      const numericId = Number(game.id);
      if (!Number.isFinite(numericId)) {
        toaster.create({ title: "IGDB ID が不正です", type: "error" });
        return;
      }
      setUpdatingId(game.id);
      const current = adminGames.get(game.id);
      try {
        const payload = {
          action: "upsert",
          igdbId: numericId,
          displayName: current?.displayName ?? null,
          visibleOnHome: current?.visibleOnHome ?? true,
          visibleOnCategory: current?.visibleOnCategory ?? true,
          featuredNewRelease: current?.featuredNewRelease ?? game.featuredNewRelease ?? false,
          featuredPopular: current?.featuredPopular ?? game.featuredPopular ?? false,
          featuredRecommended: nextState,
          sortOrder: current?.sortOrder ?? null,
        };
        const response = await fetch("/api/admin/games", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          throw new Error(`failed: ${response.status}${errorText ? `\n${errorText}` : ""}`);
        }

        setAdminGames((prev) => {
          const next = new Map(prev);
          const existing = next.get(game.id);
          const updated: AdminGame = {
            ...game,
            visibleOnHome: payload.visibleOnHome,
            visibleOnCategory: payload.visibleOnCategory,
            featuredNewRelease: payload.featuredNewRelease,
            featuredPopular: payload.featuredPopular,
            featuredRecommended: payload.featuredRecommended,
            sortOrder: payload.sortOrder,
          };
          if (existing) {
            next.set(game.id, { ...existing, featuredRecommended: payload.featuredRecommended });
          } else {
            next.set(game.id, updated);
          }
          return next;
        });

        if (nextState) {
          setNewReleaseState((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.id !== game.id),
          }));
          setPopularState((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.id !== game.id),
          }));
        } else {
          void fetchHighlights();
        }

        toaster.create({
          title: nextState ? "おすすめに追加しました" : "おすすめから外しました",
          type: "success",
          duration: 1500,
        });
      } catch (error) {
        console.error(error);
        toaster.create({
          title: "おすすめ設定の更新に失敗しました",
          description: error instanceof Error ? error.message : undefined,
          type: "error",
        });
      } finally {
        setUpdatingId(null);
      }
    },
    [adminGames, fetchHighlights]
  );

  const handleRemoveRecommended = useCallback(
    (game: Game) => {
      void upsertRecommended(game, false);
    },
    [upsertRecommended]
  );

  return (
    <Box bg="black" minH="100vh" py={10}>
      <Container maxW="1200px">
        <Stack gap={10}>
          <Flex
            align={{ base: "flex-start", md: "center" }}
            justify="space-between"
            gap={6}
            direction={{ base: "column", md: "row" }}
            bg="gray.800"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.700"
            p={6}
            boxShadow="lg"
          >
            <Box>
              <Heading size="lg" color="white" fontWeight="semibold">
                ホームページ掲載管理
              </Heading>
              <Text color="gray.300" mt={3} maxW="560px">
                新作・人気リストからおすすめ枠に載せたいゲームを選択できます。
              </Text>
            </Box>
            <HStack gap={3} flexWrap="wrap">
              <Button
                bg="gray.100"
                color="gray.900"
                _hover={{ bg: "white" }}
                _active={{ bg: "gray.200" }}
                onClick={() => void fetchAdminGames()}
                loading={adminLoading}
                loadingText="更新中"
              >
                管理データを再読込
              </Button>
              <Button
                colorPalette="blue"
                onClick={() => void fetchHighlights()}
                loading={newReleaseState.loading || popularState.loading}
                loadingText="取得中"
              >
                最新ハイライト取得
              </Button>
              <HStack gap={2} maxW={{ base: "full", md: "360px" }} w="full">
                <InputGroup startElement={<LuSearch />}>
                    <Input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.currentTarget.value)}
                      placeholder="タイトルやIDで検索"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _placeholder={{ color: "gray.400" }}
                    />
                    </InputGroup>
                <Button variant="solid" colorPalette="teal" size="sm" onClick={() => void handleLookup()}>
                  ID 取得
                </Button>
              </HStack>
            </HStack>
          </Flex>

          <Stack gap={4}>
            <Flex align="center" justify="space-between">
              <Heading size="md" color="white">
                おすすめに掲載中
              </Heading>
              <Text color="gray.400" fontSize="sm">
                最大数を決めたい場合はソート順を利用してください。
              </Text>
            </Flex>
            {adminLoading ? (
              <Flex align="center" justify="center" py={12}>
                <Spinner size="lg" color="teal.300" />
              </Flex>
            ) : filteredRecommendedGames.length === 0 ? (
              <Stack
                align="center"
                justify="center"
                bg="gray.800"
                p={8}
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.700"
                gap={4}
              >
                <Text color="gray.300" textAlign="center">
                  {normalizedSearch
                    ? "検索条件に一致するおすすめゲームが見つかりません。"
                    : "まだおすすめ枠にゲームがありません。下のリストから選択してください。"}
                </Text>
              </Stack>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                {filteredRecommendedGames.map((game) => (
                  <GameGridCard
                    key={game.id}
                    game={game}
                    actionLabel="おすすめを解除"
                    onAction={() => handleRemoveRecommended(game)}
                    disabled={updatingId === game.id}
                  >
                    <HStack gap={2}>
                      {game.featuredNewRelease && <Badge colorPalette="blue">新作</Badge>}
                      {game.featuredPopular && <Badge colorPalette="orange">人気</Badge>}
                    </HStack>
                  </GameGridCard>
                ))}
              </SimpleGrid>
            )}
          </Stack>

          <Stack gap={6}>
            <Stack gap={3}>
              <Heading size="md" color="white">
                新作ゲーム（自動取得）
              </Heading>
              <Text color="gray.400" fontSize="sm">
                直近 90 日以内に日本で発売されたタイトルを表示しています。
              </Text>
              {highlightError ? <Text color="red.300">{highlightError}</Text> : null}
            </Stack>
            {newReleaseState.loading ? (
              <Flex align="center" justify="center" py={12}>
                <Spinner size="lg" color="teal.300" />
              </Flex>
            ) : filteredNewReleaseItems.length === 0 ? (
              <Text color="gray.400">検索条件に一致する新作が見つかりません。</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                {filteredNewReleaseItems.map((game) => {
                  const isRecommended = adminGames.get(game.id)?.featuredRecommended ?? false;
                  return (
                    <GameGridCard
                      key={`new-${game.id}`}
                      game={game}
                      actionLabel={isRecommended ? "おすすめに掲載中" : "おすすめに追加"}
                      onAction={() => void upsertRecommended(game, !isRecommended)}
                      disabled={updatingId === game.id || isRecommended}
                    >
                      <Badge colorPalette="blue">新作</Badge>
                    </GameGridCard>
                  );
                })}
              </SimpleGrid>
            )}
          </Stack>

          <Stack gap={6}>
            <Stack gap={3}>
              <Heading size="md" color="white">
                人気ゲーム（自動取得）
              </Heading>
              <Text color="gray.400" fontSize="sm">
                評価数とスコアが高い日本発売済みタイトルを表示しています。
              </Text>
              {highlightError ? <Text color="red.300">{highlightError}</Text> : null}
            </Stack>
            {popularState.loading ? (
              <Flex align="center" justify="center" py={12}>
                <Spinner size="lg" color="teal.300" />
              </Flex>
            ) : filteredPopularItems.length === 0 ? (
              <Text color="gray.400">検索条件に一致する人気ゲームが見つかりません。</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                {filteredPopularItems.map((game) => {
                  const isRecommended = adminGames.get(game.id)?.featuredRecommended ?? false;
                  return (
                    <GameGridCard
                      key={`popular-${game.id}`}
                      game={game}
                      actionLabel={isRecommended ? "おすすめに掲載中" : "おすすめに追加"}
                      onAction={() => void upsertRecommended(game, !isRecommended)}
                      disabled={updatingId === game.id || isRecommended}
                    >
                      <Badge colorPalette="orange">人気</Badge>
                      <Text fontSize="xs" color="gray.400">
                        高評価タイトル
                      </Text>
                    </GameGridCard>
                  );
                })}
              </SimpleGrid>
            )}
          </Stack>

          {updatingId ? (
            <Flex
              position="fixed"
              bottom={6}
              right={6}
              bg="gray.800"
              borderRadius="full"
              px={4}
              py={2}
              align="center"
              gap={2}
              borderWidth="1px"
              borderColor="gray.600"
              boxShadow="lg"
            >
              <Spinner size="sm" color="teal.300" />
              <Text color="white" fontSize="sm">
                更新しています...
              </Text>
            </Flex>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}