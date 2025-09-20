"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

type SearchBarProps = {
  onSearch: (query: string) => void;
  delay?: number;
};

export default function SearchBar({ onSearch, delay = 500 }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // trim処理をまとめる
  const runSearch = (value: string) => {
    onSearch(value.trim());
  };

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      runSearch(query);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, onSearch, delay]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      runSearch(query); // 検索時だけ trim される
    }
    if (e.key === "Escape") {
      handleClear();
    }
  };

  const handleClear = () => {
    setQuery("");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onSearch(""); // 空文字はそのまま
  };

  return (
    <div className="relative w-full max-w-md">
      <label htmlFor="game-search" className="sr-only">
        ゲームを検索
      </label>
      <input
        id="game-search"
        type="text"
        role="searchbox"
        placeholder="ゲーム名で検索..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        aria-label="ゲーム検索"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
          aria-label="検索をクリア"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
