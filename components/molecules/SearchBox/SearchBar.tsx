import React, { useState, useMemo, useCallback } from 'react';
import { Box } from "@chakra-ui/react";
import SearchInput from '../../../atoms/Input/SearchInput';
import SearchResults from './SearchResults';
import { Game, SearchResult } from '../../../types/game';

interface SearchBarProps {
  /** 検索対象のゲーム一覧 */
  games: Game[];
  /** ゲーム選択時のハンドラー */
  onSelectGame: (gameId: string) => void;
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** 最大表示件数 */
  maxDisplay?: number;
}

/**
 * 検索バーとドロップダウン候補を統合したMoleculeコンポーネント
 * - リアルタイム検索
 * - キーボードナビゲーション（上下キー、Enter、Escape）
 * - IME変換対応
 * 
 * @example
 * ```tsx
 * <SearchBar
 *   games={allGames}
 *   onSelectGame={(id) => router.push(`/game/${id}`)}
 *   placeholder="ゲームタイトルを検索..."
 * />
 * ```
 */
const SearchBar: React.FC<SearchBarProps> = ({
  games,
  onSelectGame,
  placeholder,
  maxDisplay = 50
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  /**
   * 検索結果のフィルタリング
   * searchTextが空の場合は空配列を返す
   */
  const searchResults = useMemo<SearchResult[]>(() => {
    const trimmedText = searchText.trim();
    if (trimmedText === '') return [];
    
    const lowerSearchText = trimmedText.toLowerCase();
    
    return games
      .filter(game => 
        game.title.toLowerCase().includes(lowerSearchText)
      )
      .map(game => ({
        id: game.id,
        title: game.title
      }));
  }, [searchText, games]);

  /**
   * 検索テキスト変更時の処理
   */
  const handleSearchChange = useCallback((value: string) => {
    setSearchText(value);
    setSelectedIndex(0);
    setIsOpen(value.trim() !== '');
  }, []);

  /**
   * キーボード操作の処理
   * IME変換中は無視する
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // IME変換中はキーボード操作を無効化
    if (e.nativeEvent.isComposing) {
      return;
    }

    if (searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          handleSelectResult(searchResults[selectedIndex]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
    }
  }, [searchResults, selectedIndex]);

  /**
   * 検索結果選択時の処理
   */
  const handleSelectResult = useCallback((result: SearchResult) => {
    onSelectGame(result.id);
    setSearchText('');
    setIsOpen(false);
    setSelectedIndex(0);
  }, [onSelectGame]);

  /**
   * 検索候補リストを閉じる
   */
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * 入力欄フォーカス時の処理
   */
  const handleFocus = useCallback(() => {
    if (searchText.trim() !== '') {
      setIsOpen(true);
    }
  }, [searchText]);

  return (
    <Box position="relative" w="full">
      <SearchInput
        value={searchText}
        onChange={handleSearchChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      
      {isOpen && (
        <SearchResults
          results={searchResults}
          selectedIndex={selectedIndex}
          onSelect={handleSelectResult}
          onClose={handleClose}
          maxDisplay={maxDisplay}
        />
      )}
    </Box>
  );
};

export default SearchBar;