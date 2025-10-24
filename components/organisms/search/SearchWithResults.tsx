import React, { useState } from 'react';
import { Box, Stack, Heading, Text, Grid } from "@chakra-ui/react";
import { useRouter } from 'next/navigation';
import SearchBar from "@/components/molecules/SearchBox/SearchBar";
import GameCard from "@/components/molecules/GameCard/GameCard";

interface Game {
  id: string;
  title: string;
  categories: string[];
  iconUrl?: string;
}

interface SearchWithResultsProps {
  games: Game[];
}

const SearchWithResults: React.FC<SearchWithResultsProps> = ({ games }) => {
  const router = useRouter();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  // ゲーム選択時
  const handleSelectGame = (gameId: string) => {
    setSelectedGameId(gameId);
    // ゲーム詳細ページに遷移
    router.push(`/game/${gameId}`);
  };

  // 選択されたゲームを取得
  const selectedGame = selectedGameId 
    ? games.find(game => game.id === selectedGameId)
    : null;

  return (
    <Box w="full">
      <Stack direction="column" gap={8}>
        {/* 検索バー */}
        <Box w="full">
          <Stack direction="column" gap={4} mb={6}>
            <Heading as="h2" size="lg" color="white">
              ゲームを検索
            </Heading>
            <Text color="gray.400" fontSize="sm">
              タイトルを入力して検索してください
            </Text>
          </Stack>
          
          <SearchBar
            games={games}
            onSelectGame={handleSelectGame}
            placeholder="ゲームタイトルを検索..."
          />
        </Box>

        {/* 検索結果表示（オプション） */}
        {selectedGame && (
          <Box w="full">
            <Heading as="h3" size="md" color="white" mb={4}>
              選択されたゲーム
            </Heading>
            <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
              <GameCard
                title={selectedGame.title}
                categories={selectedGame.categories}
                iconUrl={selectedGame.iconUrl}
                onClick={() => router.push(`/game/${selectedGame.id}`)}
              />
            </Grid>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default SearchWithResults;
