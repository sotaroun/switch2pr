import React from 'react';
import { Input } from "@chakra-ui/react";

interface SearchInputProps {
  /** 検索テキストの現在値 */
  value: string;
  /** 検索テキスト変更時のハンドラー */
  onChange: (value: string) => void;
  /** フォーカス時のハンドラー */
  onFocus?: () => void;
  /** キーボード操作時のハンドラー */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** プレースホルダーテキスト */
  placeholder?: string;
  /** 入力欄の幅 */
  width?: string;
}

/**
 * 検索入力フィールドのAtomコンポーネント
 * 
 * @example
 * ```tsx
 * <SearchInput
 *   value={searchText}
 *   onChange={setSearchText}
 *   placeholder="ゲームタイトルを検索..."
 * />
 * ```
 */
const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onFocus,
  onKeyDown,
  placeholder = "ゲームタイトルを検索...",
  width = "full"
}) => {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      width={width}
      bg="gray.800"
      color="white"
      borderColor="gray.600"
      _placeholder={{ color: "gray.400" }}
      _hover={{ borderColor: "gray.500" }}
      _focus={{
        borderColor: "blue.400",
        boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
        outline: "none"
      }}
      size="lg"
      aria-label={placeholder}
      autoComplete="off"
    />
  );
};

export default SearchInput;