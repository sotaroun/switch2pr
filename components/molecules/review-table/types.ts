import type { ReactNode } from "react";

export type Source = "youtube" | "oneliner";

export type YoutubeReview = {
  videoId: string;
  videoTitle: string;
  channelTitle: string;
  channelId: string;
  channelUrl: string;
  comment: string;
  author: string;
  publishedAt: string;
  url: string;
  likeCount?: number;
  isOfficialLike: boolean;
};

export type OnelinerReview = {
  id?: string;
  user: string;
  comment: string;
  rating: number;
  postedAt?: string;
  helpful?: number;
  status?: string;
};

export type GameReviews = {
  youtube: YoutubeReview[];
  oneliner: OnelinerReview[];
};

export type ColumnDefinition<T> = {
  key: keyof T;
  header: ReactNode;
  render?: (row: T, index: number) => ReactNode;
};

export type SourceRowMap = {
  youtube: YoutubeReview;
  oneliner: OnelinerReview;
};

export type ColumnsMap = {
  [K in Source]: ColumnDefinition<SourceRowMap[K]>[];
};

export type SortTab = {
  label: string;
  isActive?: boolean;
};
