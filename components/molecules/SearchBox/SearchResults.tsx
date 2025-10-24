import React, { useEffect, useRef, useCallback } from 'react';
import { Box, Text } from "@chakra-ui/react";
import { SearchResult } from "@/types/game";

interface SearchResultsProps {
  /** 検索結果一覧 */
  results: SearchResult[];
  /** 現在選択中のインデックス */
  selectedIndex: number;
  /** 結果選択時のハンドラー */
  onSelect: (result: SearchResult) => void;
  /** 候補リストを閉じるハンドラー */
  onClose: () => void;
  /** 最大表示件数（デフォルト: 50） */
  maxDisplay?: number;
  /** タイトルの最大文字数（デフォルト: 100） */
  maxTitleLength?: number;
}

/**
 * 検索候補リストを表示するMoleculeコンポーネント
 * - キーボードナビゲーション対応
 * - 外クリックで閉じる
 * - 長いタイトルは省略表示
 * 
 * @example
 * ```tsx
 * <SearchResults
 *   results={searchResults}
 *   selectedIndex={selectedIndex}
 *   onSelect={handleSelect}
 *   onClose={handleClose}
 * />
 * ```
 */
const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  selectedIndex,
  onSelect,
  onClose,
  maxDisplay = 50,
  maxTitleLength = 100
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  /**
   * 選択項目が変わったら自動スクロール
   */
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  /**
   * 外クリック検知でリストを閉じる
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  /**
   * タイトルを指定文字数で省略
   */
  const truncateText = useCallback((text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }, []);

  // 結果が空の場合は何も表示しない
  if (results.length === 0) {
    return null;
  }

  const displayResults = results.slice(0, maxDisplay);

  return (
    <Box
      ref={listRef}
      position="absolute"
      top="100%"
      left={0}
      right={0}
      mt={2}
      bg="gray.800"
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.600"
      maxH="400px"
      overflowY="auto"
      zIndex={1000}
      boxShadow="lg"
      role="listbox"
      aria-label="検索結果"
    >
      <Box as="ul" listStyleType="none" p={0} m={0}>
        {displayResults.map((result, index) => {
          const isSelected = index === selectedIndex;
          
          return (
            <Box
              as="li"
              key={result.id}
              ref={isSelected ? selectedItemRef : null}
              px={4}
              py={3}
              cursor="pointer"
              bg={isSelected ? "blue.600" : "transparent"}
              _hover={{ bg: isSelected ? "blue.600" : "gray.700" }}
              transition="background 0.15s ease"
              onClick={() => onSelect(result)}
              borderBottomWidth={index < displayResults.length - 1 ? "1px" : 0}
              borderBottomColor="gray.700"
              role="option"
              aria-selected={isSelected}
              tabIndex={-1}
            >
              <Text
                color="white"
                fontSize="sm"
                fontWeight={isSelected ? "semibold" : "normal"}
              >
                {truncateText(result.title, maxTitleLength)}
              </Text>
            </Box>
          );
        })}
        
        {/* 表示制限を超える結果がある場合の通知 */}
        {results.length > maxDisplay && (
          <Box
            as="li"
            px={4}
            py={2}
            textAlign="center"
            bg="gray.900"
            role="presentation"
          >
            <Text color="gray.400" fontSize="xs">
              他 {results.length - maxDisplay} 件の結果
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SearchResults;
