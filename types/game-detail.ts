export type GameDetailResponse = {
  id: number;
  name: string;
  summary?: string;
  coverUrl?: string;
  genres: string[];
  screenshots: string[];
};

export type GameOverviewData = {
  name: string;
  summary: string;
  genres: string[];
};
