import React, { memo } from 'react';
import { 
  Box, 
  Container, 
  Stack,
  Heading, 
  Text,
  Flex
} from "@chakra-ui/react";
import { MdClear } from "react-icons/md";
import CategoryFilterOrg from "@/components/organisms/search/CategoryFilter";
import PlatformFilterOrg from "@/components/organisms/search/PlatformFilter";
import ActionButton from "@/components/atoms/buttons/ActionButton";
import GameGrid from "@/components/organisms/game/GameGrid";
import { Game, GameCategory, GamePlatform } from "@/types/game";

interface CategoryTemplateProps {
  /** 利用可能なカテゴリ一覧（厳密な型） */
  categories: readonly GameCategory[];
  /** 選択中のカテゴリ（厳密な型） */
  selectedCategories: GameCategory[];
  /** 利用可能なプラットフォーム一覧 */
  platforms: readonly GamePlatform[];
  /** 選択中のプラットフォーム */
  selectedPlatforms: GamePlatform[];
  /** フィルター済みゲーム一覧 */
  filteredGames: Game[];
  
  // イベントハンドラー
  /** カテゴリ選択切り替え時のハンドラー */
  onCategoryToggle: (category: GameCategory) => void;
  /** プラットフォーム選択切り替え時のハンドラー */
  onPlatformToggle: (platform: GamePlatform) => void;
  /** 全解除時のハンドラー */
  onResetAll: () => void;
  /** ゲームカードクリック時のハンドラー */
  onGameClick: (gameId: string) => void;
  /** ゲームカードホバー時のハンドラー（オプション） */
  onGameHover?: (gameId: string) => void;
  /** ゲームカードホバー解除時のハンドラー（オプション） */
  onGameLeave?: () => void;

  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  
  // カスタマイズオプション
  /** ページタイトル */
  pageTitle?: string;
  /** ページ説明文 */
  pageDescription?: string;
}

/**
 * カテゴリページ全体のレイアウトを提供するTemplateコンポーネント
 * カテゴリ・プラットフォーム両方でフィルタリング可能
 */
const CategoryTemplate: React.FC<CategoryTemplateProps> = memo(({
  categories,
  selectedCategories,
  platforms,
  selectedPlatforms,
  filteredGames,
  onCategoryToggle,
  onPlatformToggle,
  onResetAll,
  onGameClick,
  onGameHover,
  onGameLeave,
  pageTitle = "カテゴリから探す",
  pageDescription = "お好みのジャンル・プラットフォームでゲームを絞り込み"
}) => {
  /**
   * キーボード操作（Enter/Space）の処理
   */
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

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

          {/* カテゴリセクション */}
          <Box>
            <Heading 
              as="h2" 
              size="lg" 
              color="white" 
              mb={6}
              textAlign="center"
            >
              カテゴリ選択
            </Heading>
            <CategoryFilterOrg
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryToggle={onCategoryToggle}
            />
          </Box>

          {/* プラットフォームセクション */}
          <Box>
            <Heading 
              as="h2" 
              size="lg" 
              color="white" 
              mb={6}
              textAlign="center"
            >
              プラットフォーム選択
            </Heading>
            <PlatformFilterOrg
              platforms={platforms}
              selectedPlatforms={selectedPlatforms}
              onPlatformToggle={onPlatformToggle}
            />
          </Box>

          {/* 全解除ボタン */}
          <Flex justify="center">
            <ActionButton
              onClick={onResetAll}
              onKeyDown={(e) => handleKeyDown(e, onResetAll)}
              colorScheme="red"
              icon={MdClear}
              ariaLabel="すべての選択を解除"
            >
              全解除
            </ActionButton>
          </Flex>
          
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