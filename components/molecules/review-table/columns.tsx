import { Box, Text } from "@chakra-ui/react";
import { StarRatingDisplay } from "@/components/atoms/StarRatingDisplay";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import type { ColumnsMap } from "./types";
import { formatDate } from "./utils";

const renderTruncatedLink = (
  text: string,
  href: string,
  color: string,
  maxWidth: string = "240px"
) => (
  <Box
    maxW={maxWidth}
    overflow="hidden"
    display="-webkit-box"
    style={{ WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
  >
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color,
        fontSize: "0.875rem",
        fontWeight: 600,
        textDecoration: "underline",
      }}
      title={text}
    >
      {text}
    </a>
  </Box>
);

export const baseColumnsMap: ColumnsMap = {
  youtube: [
    {
      key: "videoTitle",
      header: "動画タイトル",
      render: (row) =>
        renderTruncatedLink(
          row.videoTitle,
          row.url,
          row.isOfficialLike ? "rgba(255, 255, 255, 0.92)" : "rgba(255, 255, 255, 0.85)"
        ),
    },
    {
      key: "channelTitle",
      header: "チャンネル",
      render: (row) =>
        renderTruncatedLink(
          row.channelTitle,
          row.channelUrl,
          "rgba(255, 255, 255, 0.85)",
          "200px"
        ),
    },
    {
      key: "comment",
      header: "コメント",
      render: (row) => (
        <Text
          color="rgba(255, 255, 255, 0.82)"
          fontSize="sm"
          lineHeight={1.6}
          maxW="560px"
          overflow="hidden"
          display="-webkit-box"
          style={{ WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}
          title={row.comment}
        >
          {row.comment}
        </Text>
      ),
    },
    {
      key: "author",
      header: "投稿者",
      render: (row) => (
        <Text color="rgba(255, 255, 255, 0.75)" fontSize="sm">
          {row.author}
        </Text>
      ),
    },
    {
      key: "publishedAt",
      header: "公開日",
      render: (row) => (
        <Text color="rgba(255, 255, 255, 0.7)" fontSize="sm">
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
        <Text color="rgba(255, 255, 255, 0.85)" fontSize="sm" lineHeight={1.6}>
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
          <Text color="rgba(255, 255, 255, 0.7)" fontSize="sm">
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
