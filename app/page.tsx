"use client";

import CategoriesPage from "../atoms/Button/CategoryButton";

export default function Home() {
  return (
    <CategoriesPage 
      category="RPG"
      isSelected={false}
      isAnimating={false}
      onClick={() => {
        console.log("RPG ボタンがクリックされました");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          console.log("Enterキーで RPG ボタンが選択されました");
        }
      }}
    />
  );
}
