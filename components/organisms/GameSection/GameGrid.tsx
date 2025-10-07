import React, { memo } from 'react';
import { Box, Stack, Heading, Text, Grid, Center } from "@chakra-ui/react";
import GameCard from '../../molecules/GameCard/GameCard';
import { Game } from '../../../types/game';

interface GameGridProps {
  /** 表示するゲーム一覧 */
  games: Game[];
  /** ゲームカードクリック時のハンドラー */
  onGameClick: (gameId: string) => void;
  /** グリッドのタイトル */
  title?: string;
  /** 空の場合のメッセージ */
  emptyMessage?: string;
  /** 空の場合のサブメッセージ */
  emptySubMessage?: string;
}

/**
 * ゲーム一覧をグリッド表示するOrganismコンポーネント
 * - レスポンシブグリッドレイアウト
 * - 空状態の表示
 * - 件数表示
 * 
 * @example
 * ```tsx
 * <GameGrid
 *   games={filteredGames}
 *   onGameClick={(id) => router.push(`/game/${id}`)}
 *   title="ゲーム一覧"
 * />
 * ```
 */
const GameGrid: React.FC<GameGridProps> = memo(({ 
  games, 
  onGameClick,
  title = "ゲーム一覧",
  emptyMessage = "条件に合うゲームがありません",
  emptySubMessage = "別のカテゴリを選択してください"
}) => {
  return (
    <Box w="full" as="section" aria-labelledby="game-grid-title">
      <Stack direction="column" gap={6}>
        <Box textAlign="center">
          <Heading 
            id="game-grid-title"
            as="h2" 
            size="lg" 
            color="white" 
            mb={2}
          >
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
            role="list"
            aria-label="ゲーム一覧"
          >
            {games.map((game) => (
              <Box key={game.id} role="listitem">
                <GameCard
                  title={game.title}
                  categories={game.categories}
                  iconUrl={game.iconUrl}
                  onClick={() => onGameClick(game.id)}
                />
              </Box>
            ))}
          </Grid>
        ) : (
          <Center py={12} textAlign="center" role="status">
            <Stack direction="column" gap={4}>
              <Text color="gray.400" fontSize="lg">
                {emptyMessage}
              </Text>
              <Text color="gray.500" fontSize="sm">
                {emptySubMessage}
              </Text>
            </Stack>
          </Center>
        )}
      </Stack>
    </Box>
  );
});

GameGrid.displayName = 'GameGrid';

export default GameGrid;