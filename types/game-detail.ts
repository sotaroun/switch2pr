export type GameDetailResponse = {
  id: number;
  name: string;
  summary?: string;
  coverUrl?: string;
  genres: string[];
  screenshots: string[];
};

export type GameOverviewMock = {
  id: number;
  name: string;
  summaryJa?: string | null;
  summaryEn?: string | null;
  genres?: string[];
};

export type GameOverviewData = {
  name: string;
  summary: string;
  genres: string[];
};
