import React from 'react';
import { 
  Box, 
  Container, 
  Stack,
  Heading, 
  Text
} from "@chakra-ui/react";
import CategoryFilterOrg from '../../organisms/SearchSection/CategoryFilter';
import SearchSection from '../../organisms/SearchSection/SearchSection';
import GameGrid from '../../organisms/GameSection/GameGrid';

interface Game {
  id: string;
  title: string;
  categories: string[];
  iconUrl?: string;
}

interface CategoryTemplateProps {
  // データ
  games: Game[];
  categories: string[];
  selectedCategories: string[];
  filteredGames: Game[];
  
  // イベントハンドラー
  onCategoryToggle: (category: string) => void;
  onReset: () => void;
  onSelectGame: (gameId: string) => void;
  onGameClick: (gameId: string) => void;
  
  // オプション
  pageTitle?: string;
  pageDescription?: string;
}

const CategoryTemplate: React.FC<CategoryTemplateProps> = ({
  games,
  categories,
  selectedCategories,
  filteredGames,
  onCategoryToggle,
  onReset,
  onSelectGame,
  onGameClick,
  pageTitle = "カテゴリから探す",
  pageDescription = "お好みのジャンルでゲームを絞り込み"
}) => {
  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Container maxW="90%" py={8}>
        <Stack direction="column" gap={8}>
          {/* ページヘッダー */}
          <Stack direction="column" gap={4} textAlign="center">
            <Heading 
              as="h1" 
              fontSize={{ base: "3xl", md: "5xl" }} 
              color="white"
            >
              {pageTitle}
            </Heading>
            <Text color="gray.400" fontSize="lg">
              {pageDescription}
            </Text>
          </Stack>
          
          {/* 検索セクション */}
          <SearchSection
            games={games}
            onSelectGame={onSelectGame}
          />

          {/* カテゴリフィルター */}
          <CategoryFilterOrg
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryToggle={onCategoryToggle}
            onReset={onReset}
          />
          
          {/* ゲーム一覧 */}
          <GameGrid
            games={filteredGames}
            onGameClick={onGameClick}
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default CategoryTemplate;