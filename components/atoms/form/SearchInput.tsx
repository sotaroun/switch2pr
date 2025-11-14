import React from 'react';
import { Button, HStack, Icon, Input, InputGroup } from "@chakra-ui/react";
import { Search as SearchIcon } from "lucide-react";

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
  /** ボタンを表示するか */
  showButton?: boolean;
  /** ボタン押下時のハンドラー */
  onSubmit?: () => void;
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
  width = "full",
  showButton = false,
  onSubmit,
}) => {
  return (
    <HStack gap={2} w={width} maxW="100%" align="stretch">
  <InputGroup
    flex="1"
    startElement={<Icon as={SearchIcon} color="gray.400" boxSize={4} />}
      >
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          bg="gray.800"
          color="white"
          borderColor="gray.600"
          _placeholder={{ color: "gray.400" }}
          _hover={{ borderColor: "gray.500" }}
          _focus={{
            borderColor: "blue.400",
            boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
            outline: "none",
          }}
          size="lg"
          aria-label={placeholder}
          autoComplete="off"
        />
      </InputGroup>
      {showButton ? (
        <Button
          size="md"
          bg="white"
          color="gray.900"
          _hover={{ bg: "gray.200" }}
          _active={{ bg: "gray.300" }}
          onClick={onSubmit}
        >
          検索
        </Button>
      ) : null}
    </HStack>
  );
};

export default SearchInput;
