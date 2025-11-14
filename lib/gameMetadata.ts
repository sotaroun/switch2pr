import type { GameCategory, GamePlatform } from "@/types/game";

const GENRE_TO_CATEGORY: Record<string, GameCategory> = {
  "Role-playing (RPG)": "RPG",
  Adventure: "アクション",
  Action: "アクション",
  Platform: "アクション",
  "Hack and slash/Beat 'em up": "アクション",
  Fighting: "アクション",
  Shooter: "シューター",
  Sport: "スポーツ",
  Racing: "スポーツ",
  Puzzle: "パズル",
  "Quiz/Trivia": "パズル",
  Music: "アクション",
  Simulator: "スポーツ",
  Strategy: "RPG",
  "Real Time Strategy (RTS)": "RPG",
  Tactical: "RPG",
  "Turn-based strategy (TBS)": "RPG",
  Indie: "アクション",
  Arcade: "アクション",
};

const DEFAULT_CATEGORY: GameCategory = "アクション";

type RawGenre = { name?: string | null } | null | undefined;

export function mapGenres(genres: RawGenre[] | null | undefined): GameCategory[] {
  if (!genres || genres.length === 0) {
    return [DEFAULT_CATEGORY];
  }

  const mapped = genres
    .map((genre) => {
      const name = genre?.name;
      if (!name) return undefined;
      return GENRE_TO_CATEGORY[name] ?? DEFAULT_CATEGORY;
    })
    .filter((category): category is GameCategory => Boolean(category));

  if (mapped.length === 0) {
    return [DEFAULT_CATEGORY];
  }

  return Array.from(new Set(mapped));
}

type RawPlatform = { abbreviation?: string | null; name?: string | null } | null | undefined;

const PLATFORM_RULES: Array<{ match: RegExp; platform: GamePlatform }> = [
  { match: /switch|nsw|nintendo switch/i, platform: "Nintendo Switch" },
  { match: /playstation 5|ps5/i, platform: "PlayStation 5" },
  { match: /playstation 4|ps4/i, platform: "PlayStation 4" },
  { match: /series x|series s|xsx|xss|xbox series/i, platform: "Xbox Series X|S" },
  { match: /nintendo switch2| nintendo swith 2|swith2|swithch 2|nsw2/i, platform: "Nintendo Switch 2" },
  { match: /Xbox Series X|Xbox Series S/i, platform: "Xbox Series X|S" },
  { match: /pc|windows|mac|steam|linux/i, platform: "PC" },
  { match: /ios|android|mobile|smartphone/i, platform: "Mobile" },
];

export function mapPlatforms(platforms: RawPlatform[] | null | undefined): GamePlatform[] {
  if (!platforms || platforms.length === 0) {
    return [];
  }

  const result = new Set<GamePlatform>();

  platforms.forEach((platform) => {
    const target = (platform?.abbreviation ?? platform?.name ?? "").trim();
    if (!target) return;
    const matched = PLATFORM_RULES.find((rule) => rule.match.test(target));
    if (matched) {
      result.add(matched.platform);
    } else {
      result.add("その他");
    }
  });

  return Array.from(result);
}
