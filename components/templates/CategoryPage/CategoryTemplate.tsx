import React, { memo } from 'react';
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
import { Game } from '../../../types/game';

interface CategoryTemplateProps {
  /** 全ゲーム一覧（検索用） */
  games: Game[];
  /** 利用可能なカテゴリ一覧 */
  categories: string[];
  /** 選択中のカテゴリ */
  selectedCategories: string[];
  /** フィルター済みゲーム一覧 */
  filteredGames: Game[];
  
  // イベントハンドラー
  /** カテゴリ選択切り替え時のハンドラー */
  onCategoryToggle: (category: string) => void;
  /** カテゴリリセット時のハンドラー */
  onReset: () => void;
  /** 検索結果選択時のハンドラー */
  onSelectGame: (gameId: string) => void;
  /** ゲームカードクリック時のハンドラー */
  onGameClick: (gameId: string) => void;
  
  // カスタマイズオプション
  /** ページタイトル */
  pageTitle?: string;
  /** ページ説明文 */
  pageDescription?: string;
}

/**
 * カテゴリページ全体のレイアウトを提供するTemplateコンポーネント
 * - ページヘッダー
 * - 検索セクション
 * - カテゴリフィルター
 * - ゲーム一覧グリッド
 * 
 * @example
 * ```tsx
 * <CategoryTemplate
 *   games={allGames}
 *   categories={allCategories}
 *   selectedCategories={selected}
 *   filteredGames={filtered}
 *   onCategoryToggle={handleToggle}
 *   onReset={handleReset}
 *   onSelectGame={handleSelectGame}
 *   onGameClick={handleGameClick}
 * />
 * ```
 */
const CategoryTemplate: React.FC<CategoryTemplateProps> = memo(({
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
          <Stack 
            direction="column" 
            gap={4} 
            textAlign="center"
            as="header"
          >
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
});

CategoryTemplate.displayName = 'CategoryTemplate';

export default CategoryTemplate;