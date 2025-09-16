"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react"; // ×アイコン用（shadcn/ui などのアイコンライブラリ）

type SearchBarProps = {
  onSearch: (query: string) => void; // 検索ワードを親に通知
  delay?: number; // デバウンス時間（ms）
};

export default function SearchBar({ onSearch, delay = 500 }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 入力が止まったらデバウンス検索
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (query.trim() !== "") {
      timeoutRef.current = setTimeout(() => {
        onSearch(query.trim());
      }, delay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Enterキーで即検索
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      onSearch(query.trim());
    }
    if (e.key === "Escape") {
      handleClear();
    }
  };

  // 入力リセット
  const handleClear = () => {
    setQuery("");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onSearch("");
  };

  return (
    <div className="relative w-full max-w-md">
      {/* ラベル（画面リーダー用） */}
      <label htmlFor="game-search" className="sr-only">
        ゲームを検索
      </label>

      {/* 入力欄 */}
      <input
        id="game-search"
        type="text"
        placeholder="ゲーム名で検索..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        aria-label="ゲーム検索"
      />

      {/* クリアボタン（入力がある時だけ表示） */}
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
