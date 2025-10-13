import React from 'react';
import { Box, Stack, Heading, Text } from "@chakra-ui/react";
import SearchBar from '../../molecules/SearchBox/SearchBar';
import { Game } from '../../../types/game';

interface SearchSectionProps {
  /** 検索対象のゲーム一覧 */
  games: Game[];
  /** ゲーム選択時のハンドラー */
  onSelectGame: (gameId: string) => void;
  /** セクションタイトル */
  title?: string;
  /** セクション説明文 */
  description?: string;
  /** 検索バーのプレースホルダー */
  placeholder?: string;
}

/**
 * 検索セクション全体を管理するOrganismコンポーネント
 * タイトル、説明文、検索バーを含む
 * 
 * @example
 * ```tsx
 * <SearchSection
 *   games={allGames}
 *   onSelectGame={(id) => router.push(`/game/${id}`)}
 *   title="ゲームを検索"
 *   description="タイトルを入力して直接検索"
 * />
 * ```
 */
const SearchSection: React.FC<SearchSectionProps> = ({ 
  games, 
  onSelectGame,
  title = "ゲームを検索",
  description = "タイトルを入力して直接検索",
  placeholder = "ゲームタイトルを検索..."
}) => {
  return (
    <Box w="full" as="section" aria-labelledby="search-title">
      <Stack direction="column" gap={3} mb={4}>
        <Heading 
          id="search-title"
          as="h2" 
          size="md" 
          color="white"
        >
          {title}
        </Heading>
        <Text color="gray.400" fontSize="sm">
          {description}
        </Text>
      </Stack>
      <SearchBar
        games={games}
        onSelectGame={onSelectGame}
        placeholder={placeholder}
      />
    </Box>
  );
};

export default SearchSection;