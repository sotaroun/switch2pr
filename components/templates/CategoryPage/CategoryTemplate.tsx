import React, { memo } from 'react';
import { 
  Box, 
  Container, 
  Stack,
  Heading, 
  Text
} from "@chakra-ui/react";
import CategoryFilterOrg from "@/components/organisms/search/CategoryFilter";
import SearchSection from "@/components/organisms/search/SearchSection";
import GameGrid from "@/components/organisms/game/GameGrid";
import { Game, GameCategory } from "@/types/game";

interface CategoryTemplateProps {
  /** 全ゲーム一覧（検索用） */
  games: Game[];
  /** 利用可能なカテゴリ一覧（厳密な型） */
  categories: readonly GameCategory[];
  /** 選択中のカテゴリ（厳密な型） */
  selectedCategories: GameCategory[];
  /** フィルター済みゲーム一覧 */
  filteredGames: Game[];
  
  // イベントハンドラー
  /** カテゴリ選択切り替え時のハンドラー */
  onCategoryToggle: (category: GameCategory) => void;
  /** カテゴリリセット時のハンドラー */
  onReset: () => void;
  /** 検索結果選択時のハンドラー */
  onSelectGame: (gameId: string) => void;
  /** ゲームカードクリック時のハンドラー */
  onGameClick: (gameId: string) => void;
  /** ゲームカードホバー時のハンドラー（オプション） */
  onGameHover?: (gameId: string) => void;
  /** ゲームカードホバー解除時のハンドラー（オプション） */
  onGameLeave?: () => void;
  
  // カスタマイズオプション
  /** ページタイトル */
  pageTitle?: string;
  /** ページ説明文 */
  pageDescription?: string;
}

/**
 * カテゴリページ全体のレイアウトを提供するTemplateコンポーネント
 * オーバーレイコメント対応版
 * 
 * @example
 * ```tsx
 * <CategoryTemplate
 *   games={allGames}
 *   categories={ALL_GAME_CATEGORIES}
 *   selectedCategories={selected}
 *   filteredGames={filtered}
 *   onCategoryToggle={handleToggle}
 *   onReset={handleReset}
 *   onSelectGame={handleSelectGame}
 *   onGameClick={handleGameClick}
 *   onGameHover={handleGameHover}
 *   onGameLeave={handleGameLeave}
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
  onGameHover,
  onGameLeave,
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
            onGameHover={onGameHover}
            onGameLeave={onGameLeave}
          />
        </Stack>
      </Container>
    </Box>
  );
});

CategoryTemplate.displayName = 'CategoryTemplate';

export default CategoryTemplate;
