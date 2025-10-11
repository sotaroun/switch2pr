import { Box, Text } from "@chakra-ui/react";
import { ChannelTag } from "../../atoms/ChannelTag";
import { StarRatingDisplay } from "../../atoms/StarRatingDisplay";
import { StatusBadge } from "../../atoms/StatusBadge";
import type { ColumnsMap } from "./types";
import { formatDate } from "./utils";

export const baseColumnsMap: ColumnsMap = {
  youtube: [
    {
      key: "user",
      header: "ユーザー",
      render: (row) => (
        <Text fontWeight="semibold" color="rgba(255, 255, 255, 0.97)">
          {row.user}
        </Text>
      ),
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
      key: "title",
      header: "動画タイトル",
      render: (row) => (
        <Text color="rgba(255, 240, 246, 0.94)" fontSize="sm" fontWeight="semibold">
          {row.title}
        </Text>
      ),
    },
    {
      key: "channel",
      header: "チャンネル",
      render: (row) => <ChannelTag name={row.channel} />,
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
