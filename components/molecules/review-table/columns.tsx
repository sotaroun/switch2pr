import { Box, Text } from "@chakra-ui/react";
import { ChannelTag } from "../../atoms/ChannelTag";
import { StarRatingDisplay } from "../../atoms/StarRatingDisplay";
import { StatusBadge } from "../../atoms/StatusBadge";
import type { ColumnsMap } from "./types";
import { formatDate } from "./utils";

export const baseColumnsMap: ColumnsMap = {
  youtube: [
    {
      key: "videoTitle",
      header: "動画タイトル",
      render: (row) => (
        <Text
          as="a"
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          color={row.isOfficialLike ? "rgba(255, 240, 246, 0.94)" : "rgba(240, 244, 255, 0.9)"}
          fontSize="sm"
          fontWeight="semibold"
          textDecoration="underline"
        >
          {row.videoTitle}
        </Text>
      ),
    },
    {
      key: "channelTitle",
      header: "チャンネル",
      render: (row) => <ChannelTag name={row.channelTitle} />,
    },
    {
      key: "comment",
      header: "コメント",
      render: (row) => (
        <Text color="rgba(240, 244, 255, 0.95)" fontSize="sm" lineHeight={1.6}>
          {row.comment}
        </Text>
      ),
    },
    {
      key: "author",
      header: "投稿者",
      render: (row) => (
        <Text color="rgba(235, 244, 255, 0.88)" fontSize="sm">
          {row.author}
        </Text>
      ),
    },
    {
      key: "publishedAt",
      header: "公開日",
      render: (row) => (
        <Text color="rgba(230, 240, 255, 0.88)" fontSize="sm">
          {formatDate(row.publishedAt)}
        </Text>
      ),
    },
  ],
  oneliner: [
    {
      key: "user",
      header: "ユーザー",
      render: (row) => (
        <Text fontWeight="semibold" color="rgba(255,255,255,0.9)">
          {row.user}
        </Text>
      ),
    },
    {
      key: "rating",
      header: "評価",
      render: (row) => <StarRatingDisplay rating={row.rating} />,
    },
    {
      key: "comment",
      header: "コメント",
      render: (row) => (
        <Text color="rgba(255, 255, 255, 1)" fontSize="sm" lineHeight={1.6}>
          {row.comment}
        </Text>
      ),
    },
    {
      key: "postedAt",
      header: "投稿日",
      render: (row) => {
        const display = formatDate(row.postedAt);
        return (
          <Text color="rgba(230, 240, 255, 0.88)" fontSize="sm">
            {display}
          </Text>
        );
      },
    },
    {
      key: "helpful",
      header: <Box as="span" whiteSpace="nowrap">参考</Box>,
    },
    {
      key: "status",
      header: <Box as="span" whiteSpace="nowrap">ステータス</Box>,
      render: (row) => <StatusBadge status={row.status ?? "-"} />,
    },
  ],
};
