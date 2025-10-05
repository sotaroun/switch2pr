import React from 'react';
import { Box, Stack, Heading, Text, Grid, Center } from "@chakra-ui/react";
import GameCard from '../../molecules/GameCard/GameCard';

interface Game {
  id: string;
  title: string;
  categories: string[];
  iconUrl?: string;
}

interface GameGridProps {
  games: Game[];
  onGameClick: (gameId: string) => void;
  title?: string;
}

const GameGrid: React.FC<GameGridProps> = ({ 
  games, 
  onGameClick,
  title = "ゲーム一覧" 
}) => {
  return (
    <Box w="full">
      <Stack direction="column" gap={6}>
        <Box textAlign="center">
          <Heading as="h2" size="lg" color="white" mb={2}>
            {title} ({games.length}件)
          </Heading>
        </Box>
        
        {games.length > 0 ? (
          <Grid 
            templateColumns={{ 
              base: "repeat(2, 1fr)", 
              md: "repeat(4, 1fr)", 
              lg: "repeat(5, 1fr)" 
            }} 
            gap={6} 
            w="full"
          >
            {games.map((game) => (
              <GameCard
                key={game.id}
                title={game.title}
                categories={game.categories}
                iconUrl={game.iconUrl}
                onClick={() => onGameClick(game.id)}
              />
            ))}
          </Grid>
        ) : (
          <Center py={12} textAlign="center">
            <Stack direction="column" gap={4}>
              <Text color="gray.400" fontSize="lg">
                条件に合うゲームがありません
              </Text>
              <Text color="gray.500" fontSize="sm">
                別のカテゴリを選択してください
              </Text>
            </Stack>
          </Center>
        )}
      </Stack>
    </Box>
  );
};

export default GameGrid;