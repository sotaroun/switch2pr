"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Box, Stack, Table, Text } from "@chakra-ui/react";
import { useParams } from "next/navigation";

import { HelpfulVoteButton } from "../atoms/HelpfulVoteButton";
import { BubbleIcon } from "../atoms/icons/BubbleIcon";
import { YouTubeIcon } from "../atoms/icons/YouTubeIcon";
import { ReviewSourceToggle } from "../molecules/review-table/ReviewSourceToggle";
import { ReviewTableHeader } from "../molecules/review-table/ReviewTableHeader";
import { baseColumnsMap } from "../molecules/review-table/columns";
import { sortOptions } from "../molecules/review-table/config";
import { buildHelpfulStorageKey } from "../molecules/review-table/utils";
import type { GameReviews, OnelinerReview, Source, YoutubeReview } from "../molecules/review-table/types";
import type { GameDetailResponse } from "@/types/game-detail";
import {
  ensureAnonReviewSession,
  getBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/browser-client";

const HELPFUL_STORAGE_KEY = "switch2pr_helpful_votes";

const tableTitles: Record<Source, string> = {
  youtube: "YouTube コメント",
  oneliner: "一言コメント",
};

const subtitleTemplate: Record<Source, (total: number) => string> = {
  youtube: (total) => `全${total}件のコメント`,
  oneliner: (total) => `全${total}件の投稿`,
};

const headerIconMap: Record<Source, ReactNode> = {
  youtube: (
    <YouTubeIcon
      boxSize="2.5rem"
      color="#ff6074"
      bodyColor="#ff3145"
      accentColor="#ffffff"
    />
  ),
  oneliner: <BubbleIcon boxSize="2.3rem" color="#57c6ff" />,
};

export default function ReviewSwitcherTable() {
  const params = useParams();
  const rawId =
    (params as Record<string, string | string[] | undefined>).id ??
    (params as Record<string, string | string[] | undefined>).gameId;
  const gameId = typeof rawId === "string" ? rawId : null;
  const supabaseConfigured = isSupabaseConfigured();

  const [src, setSrc] = useState<Source>("youtube");
  const [reviews, setReviews] = useState<GameReviews>({ youtube: [], oneliner: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votedKeys, setVotedKeys] = useState<string[]>([]);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [helpfulOverrides, setHelpfulOverrides] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(HELPFUL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const keys = parsed.filter((item): item is string => typeof item === "string");
          if (keys.length > 0) {
            setVotedKeys(keys);
          }
        }
      }
    } catch {
      // localStorage が利用できない場合は無視する
    } finally {
      setStorageHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!storageHydrated || typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(HELPFUL_STORAGE_KEY, JSON.stringify(votedKeys));
    } catch {
      // noop
    }
  }, [storageHydrated, votedKeys]);

  const votedSet = useMemo(() => new Set(votedKeys), [votedKeys]);

  const handleHelpfulVote = useCallback(
    async (review: OnelinerReview) => {
      if (!storageHydrated || !supabaseConfigured || !gameId || !review.id) {
        return;
      }

      const storageKey = buildHelpfulStorageKey(gameId, review);
      if (votedSet.has(storageKey)) {
        return;
      }

      try {
        const client = getBrowserSupabaseClient();
        const { voterToken } = await ensureAnonReviewSession(client);

        const { error } = await client.from("oneliner_review_votes").insert({
          review_id: review.id,
          voter_token: voterToken,
        });

        if (error) {
          if (error.code === "23505") {
            setVotedKeys((prev) => [...prev, storageKey]);
            return;
          }
          throw error;
        }

        setVotedKeys((prev) => [...prev, storageKey]);
        setHelpfulOverrides((prev) => {
          const base = prev[storageKey] ?? review.helpful ?? 0;
          return { ...prev, [storageKey]: base + 1 };
        });

        setReviews((prev) => ({
          ...prev,
          oneliner: prev.oneliner.map((item) => {
            if (item.id !== review.id) {
              return item;
            }
            return {
              ...item,
              helpful: (item.helpful ?? 0) + 1,
            };
          }),
        }));
      } catch (error) {
        console.error("Failed to record helpful vote", error);
        setError((prev) => prev ?? "参考になった投票に失敗しました。");
      }
    },
    [gameId, storageHydrated, supabaseConfigured, votedSet]
  );

  const columns = useMemo(() => {
    const base = baseColumnsMap[src];
    if (src !== "oneliner") {
      return base.map((column) => ({ ...column }));
    }

    return base.map((column) => {
      if (column.key !== "helpful") {
        return { ...column };
      }

      return {
        ...column,
        render: (row: OnelinerReview) => {
          const storageKey = buildHelpfulStorageKey(gameId, row);
          const isDisabled =
            !supabaseConfigured || !storageHydrated || votedSet.has(storageKey) || !row.id;
          const count = helpfulOverrides[storageKey] ?? row.helpful ?? 0;

          return (
            <HelpfulVoteButton
              count={count}
              onClick={() => {
                void handleHelpfulVote(row);
              }}
              isDisabled={isDisabled}
            />
          );
        },
      };
    });
  }, [gameId, handleHelpfulVote, helpfulOverrides, src, storageHydrated, supabaseConfigured, votedSet]);

  const rows = reviews[src];
  const total = rows.length;

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      setError("ゲームIDが見つかりません。");
      setReviews({ youtube: [], oneliner: [] });
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        let gameName: string | null = null;
        let youtubeReviews: YoutubeReview[] = [];
        let onelinerReviews: OnelinerReview[] = [];
        const warnings: string[] = [];

        try {
          const igdbResponse = await fetch(`/api/igdb/${gameId}`, { cache: "no-store" });
          if (igdbResponse.ok) {
            const igdbJson = (await igdbResponse.json()) as GameDetailResponse;
            gameName = igdbJson.name;
          } else {
            warnings.push("IGDBからゲーム情報を取得できませんでした。");
          }
        } catch (error) {
          console.error("Failed to fetch IGDB detail", error);
          warnings.push("IGDBの取得中にエラーが発生しました。");
        }

        if (gameName) {
          try {
            const youtubeResponse = await fetch(
              `/api/youtube/reviews?query=${encodeURIComponent(gameName)}`,
              { cache: "no-store" }
            );
            if (youtubeResponse.ok) {
              const youtubeJson = (await youtubeResponse.json()) as {
                items?: YoutubeReview[];
              };
              youtubeReviews = youtubeJson.items ?? [];
            } else {
              warnings.push("YouTubeのレビュー取得に失敗しました。");
            }
          } catch (error) {
            console.error("Failed to fetch YouTube reviews", error);
            warnings.push("YouTubeレビュー取得中にエラーが発生しました。");
          }
        } else {
          warnings.push("YouTube検索用のゲームタイトルが見つかりません。");
        }

        if (supabaseConfigured) {
          try {
            const client = getBrowserSupabaseClient();
            const { data, error } = await client
              .from("oneliner_reviews")
              .select("id, user_name, comment, rating, helpful_count, status, created_at")
              .eq("game_id", gameId)
              .eq("status", "approved")
              .order("created_at", { ascending: false });

            if (error) {
              console.error("Failed to fetch oneliner reviews", error);
              warnings.push("一言コメント取得中にエラーが発生しました。");
            } else {
              onelinerReviews = (data ?? []).map((item) => ({
                id: item.id,
                user: item.user_name,
                comment: item.comment,
                rating: item.rating ?? 0,
                helpful: item.helpful_count ?? 0,
                status: item.status ?? undefined,
                postedAt: item.created_at ?? undefined,
              }));
            }
          } catch (error) {
            console.error("Failed to fetch oneliner reviews", error);
            warnings.push("一言コメント取得中にエラーが発生しました。");
          }
        } else {
          warnings.push("Supabaseが未設定のため、一言コメントは表示のみです。");
        }

        if (!active) {
          return;
        }

        setReviews({
          youtube: youtubeReviews,
          oneliner: onelinerReviews,
        });

        if (warnings.length > 0 && youtubeReviews.length === 0 && onelinerReviews.length === 0) {
          setError(warnings.join(" "));
        } else if (warnings.length > 0) {
          setError(warnings.join(" "));
        } else {
          setError(null);
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
        if (!active) return;
        setError("口コミデータの取得に失敗しました。");
        setReviews({ youtube: [], oneliner: [] });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      active = false;
    };
  }, [gameId, supabaseConfigured]);

  const subtitle = subtitleTemplate[src](total);
  const headerIcon = headerIconMap[src];
  const currentSortTabs = sortOptions[src];

  return (
    <Stack spacing={6} align="center" w="full">
      <ReviewSourceToggle value={src} onChange={setSrc} />

      <Box
        w="full"
        maxW="960px"
        bg="rgba(16, 22, 54, 0.94)"
        borderRadius="2xl"
        border="1px solid rgba(94, 126, 255, 0.22)"
        boxShadow="0 24px 60px rgba(24, 64, 216, 0.25)"
        px={{ base: 4, md: 6 }}
        py={{ base: 5, md: 6 }}
        textAlign="left"
      >
        <Stack spacing={5}>
          <ReviewTableHeader
            icon={headerIcon}
            title={tableTitles[src]}
            subtitle={subtitle}
            tabs={currentSortTabs}
          />

          {error && (
            <Text color="rgba(255, 102, 132, 0.85)" fontSize="sm">
              {error}
            </Text>
          )}

          <Box borderRadius="xl" overflowX="auto">
            <Table.Root
              size="md"
              variant="simple"
              sx={{
                th: {
                  fontSize: "sm",
                  fontWeight: "semibold",
                  textTransform: "none",
                  letterSpacing: "0.02em",
                  color: "#FDFEFF",
                  background:
                    "linear-gradient(135deg, rgba(24, 38, 96, 0.9), rgba(19, 33, 82, 0.9))",
                  borderColor: "rgba(52, 75, 160, 0.75)",
                  textShadow: "0 0 8px rgba(8, 14, 40, 0.6)",
                },
                td: {
                  fontSize: "sm",
                  color: "rgba(255,255,255,0.88)",
                  borderColor: "rgba(82, 108, 175, 0.28)",
                  borderBottom: "1px solid rgba(82, 108, 175, 0.28)",
                },
                "tbody tr:last-of-type td": {
                  borderBottomWidth: 0,
                },
              }}
            >
              <Table.Header>
                <Table.Row>
                  {columns.map((column) => (
                    <Table.ColumnHeader
                      key={String(column.key)}
                      color="rgba(253, 254, 255, 0.96)"
                    >
                      {column.header}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {loading ? (
                  <Table.Row>
                    <Table.Cell colSpan={columns.length}>
                      <Text color="rgba(255,255,255,0.65)">
                        口コミを読み込み中...
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ) : rows.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={columns.length}>
                      <Text color="rgba(255,255,255,0.6)">
                        このソースの口コミはまだありません。
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  rows.map((row, index) => (
                    <Table.Row
                      key={`${src}-${index}`}
                      bg="rgba(255,255,255,0.015)"
                      _hover={{ bg: "rgba(255,255,255,0.05)" }}
                      transition="background 0.2s ease"
                    >
                      {columns.map((column) => (
                        <Table.Cell key={String(column.key)}>
                          {column.render
                            ? column.render(row as never, index)
                            : (row as Record<string, ReactNode>)[
                                column.key as string
                              ] ?? ""}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
