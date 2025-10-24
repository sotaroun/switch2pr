"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Spinner,
  Stack,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
} from "@chakra-ui/react";

import type { Game } from "@/types/game";

type AdminGame = Game & {
  visibleOnHome: boolean;
  visibleOnCategory: boolean;
  sortOrder: number | null;
};

const sortGames = (games: AdminGame[]) =>
  [...games].sort((a, b) => {
    const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA === orderB) {
      return a.title.localeCompare(b.title);
    }
    return orderA - orderB;
  });

export default function AdminGamesPage() {
  const [games, setGames] = useState<AdminGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newIgdbId, setNewIgdbId] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const toast = useToast();

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/games", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`failed: ${response.status}`);
      }
      const json = (await response.json()) as { games: AdminGame[] };
      setGames(sortGames(json.games ?? []));
    } catch (error) {
      console.error(error);
      toast({ title: "ゲームの取得に失敗しました", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchGames();
  }, [fetchGames]);

  const optimisticUpdate = useCallback(
    (gameId: string, next: Partial<AdminGame>) => {
      setGames((current) =>
        sortGames(
          current.map((game) =>
            game.id === gameId
              ? {
                  ...game,
                  ...next,
                }
              : game
          )
        )
      );
    },
    []
  );

  const updateGame = useCallback(
    async (gameId: string, next: Partial<AdminGame>) => {
      const current = games.find((game) => game.id === gameId);
      if (!current) return;

      optimisticUpdate(gameId, next);

      try {
        const payload = {
          action: "upsert",
          igdbId: Number(gameId),
          displayName: next.displayName ?? current.displayName,
          visibleOnHome: next.visibleOnHome ?? current.visibleOnHome,
          visibleOnCategory: next.visibleOnCategory ?? current.visibleOnCategory,
          sortOrder: next.sortOrder ?? current.sortOrder,
        };
        const response = await fetch("/api/admin/games", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(`failed: ${response.status}`);
        }
        toast({ title: "保存しました", status: "success", duration: 1500 });
      } catch (error) {
        console.error(error);
        toast({ title: "更新に失敗しました", status: "error" });
        void fetchGames();
      }
    },
    [fetchGames, games, toast, optimisticUpdate]
  );

  const removeGame = useCallback(
    async (gameId: string) => {
      if (!window.confirm("このゲームを掲載一覧から外しますか？")) return;
      setGames((current) => current.filter((game) => game.id !== gameId));
      try {
        const response = await fetch("/api/admin/games", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "remove", igdbId: Number(gameId) }),
        });
        if (!response.ok) {
          throw new Error(`failed: ${response.status}`);
        }
        toast({ title: "削除しました", status: "success", duration: 1500 });
      } catch (error) {
        console.error(error);
        toast({ title: "削除に失敗しました", status: "error" });
        void fetchGames();
      }
    },
    [fetchGames, toast]
  );

  const handleAdd = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const igdbId = Number(newIgdbId.trim());
      if (!Number.isFinite(igdbId) || igdbId <= 0) {
        toast({ title: "IGDB ID を正しく入力してください", status: "warning" });
        return;
      }

      setAdding(true);
      try {
        const response = await fetch("/api/admin/games", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add",
            igdbId,
            displayName: newDisplayName.trim() || null,
            visibleOnHome: true,
            visibleOnCategory: true,
          }),
        });
        if (!response.ok) {
          throw new Error(`failed: ${response.status}`);
        }
        setNewIgdbId("");
        setNewDisplayName("");
        await fetchGames();
        toast({ title: "追加しました", status: "success", duration: 1500 });
      } catch (error) {
        console.error(error);
        toast({ title: "追加に失敗しました", status: "error" });
      } finally {
        setAdding(false);
      }
    },
    [fetchGames, newDisplayName, newIgdbId, toast]
  );

  const categoriesSummary = useMemo(
    () => games.map((game) => `${game.title} (${game.categories.join("・")})`).join("\n"),
    [games]
  );

  return (
    <Container maxW="960px" py={10}>
      <Stack spacing={8}>
        <Heading size="lg">掲載ゲーム管理</Heading>

        <Box as="section" bg="gray.800" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.700">
          <form onSubmit={handleAdd}>
            <Stack direction={{ base: "column", md: "row" }} spacing={4} align="flex-end">
              <Box flex="1">
                <Text mb={2} fontWeight="semibold">
                  IGDB ID
                </Text>
                <Input
                  value={newIgdbId}
                  onChange={(event) => setNewIgdbId(event.target.value)}
                  placeholder="例: 1234"
                  required
                />
              </Box>
              <Box flex="1">
                <Text mb={2} fontWeight="semibold">
                  表示名 (任意)
                </Text>
                <Input
                  value={newDisplayName}
                  onChange={(event) => setNewDisplayName(event.target.value)}
                  placeholder="任意の表示名"
                />
              </Box>
              <Button type="submit" colorScheme="teal" isLoading={adding}>
                追加
              </Button>
            </Stack>
          </form>
        </Box>

        <Box bg="gray.800" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.700">
          {loading ? (
            <Flex align="center" justify="center" py={16}>
              <Spinner size="lg" />
            </Flex>
          ) : games.length === 0 ? (
            <Text color="gray.300">現在登録されているゲームはありません。IGDB ID を追加してください。</Text>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>タイトル</Th>
                  <Th>カテゴリ</Th>
                  <Th>ホーム</Th>
                  <Th>カテゴリ</Th>
                  <Th>並び順</Th>
                  <Th>操作</Th>
                </Tr>
              </Thead>
              <Tbody>
                {games.map((game) => (
                  <Tr key={game.id}>
                    <Td>
                      <Stack spacing={1}>
                        <Text fontWeight="bold">{game.title}</Text>
                        {game.summary && (
                          <Text fontSize="sm" color="gray.400" noOfLines={2}>
                            {game.summary}
                          </Text>
                        )}
                      </Stack>
                    </Td>
                    <Td>
                      <Stack direction="row" spacing={2} wrap="wrap">
                        {game.categories.map((category) => (
                          <Box key={category} bg="gray.700" px={2} py={1} borderRadius="md" fontSize="xs">
                            {category}
                          </Box>
                        ))}
                      </Stack>
                    </Td>
                    <Td>
                      <Switch
                        isChecked={game.visibleOnHome}
                        onChange={(event) =>
                          void updateGame(game.id, { visibleOnHome: event.target.checked })
                        }
                        colorScheme="teal"
                      />
                    </Td>
                    <Td>
                      <Switch
                        isChecked={game.visibleOnCategory}
                        onChange={(event) =>
                          void updateGame(game.id, { visibleOnCategory: event.target.checked })
                        }
                        colorScheme="purple"
                      />
                    </Td>
                    <Td>
                      <Input
                        type="number"
                        value={game.sortOrder ?? ""}
                        onChange={(event) =>
                          void updateGame(game.id, {
                            sortOrder: event.target.value === "" ? null : Number(event.target.value),
                          })
                        }
                        maxW="80px"
                        size="sm"
                      />
                    </Td>
                    <Td>
                      <Stack direction="row" spacing={3} align="center">
                        <Tooltip label="IGDB 上のタイトルを別名に変更できます">
                          <Input
                            value={game.displayName ?? ""}
                            onChange={(event) =>
                              void updateGame(game.id, { displayName: event.target.value || null })
                            }
                            placeholder="表示名"
                            size="sm"
                          />
                        </Tooltip>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => void removeGame(game.id)}
                        >
                          削除
                        </Button>
                      </Stack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>

        <Box bg="gray.700" p={4} borderRadius="lg" borderWidth="1px" borderColor="gray.600">
          <Text fontWeight="semibold" mb={2}>
            現在のカテゴリ構成
          </Text>
          <Text fontFamily="mono" whiteSpace="pre-wrap" fontSize="sm" color="gray.200">
            {categoriesSummary || "（未登録）"}
          </Text>
        </Box>
      </Stack>
    </Container>
  );
}
