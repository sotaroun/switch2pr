import React, { memo } from 'react';
import { Box, Stack, Text, Flex, Badge } from "@chakra-ui/react";
import { CATEGORY_GRADIENTS } from "./constants";
import Image from "next/image";

interface GameCardProps {
  title: string;
  categories?: string[];
  iconUrl?: string;
  onClick?: () => void;
  /** ホバー開始時のハンドラー */
  onMouseEnter?: () => void;
  /** ホバー終了時のハンドラー */
  onMouseLeave?: () => void;
  /** 横スクロール時のセンター表示（モバイル用） */
  isCenter?: boolean;
  /** コンパクト表示モード（横スクロール用） */
  compact?: boolean;
}

/**
 * ゲームカード表示のMoleculeコンポーネント
 * オーバーレイコメント対応版 + 横スクロール対応
 * 
 * @example
 * ```tsx
 * <GameCard
 *   title="ゼルダの伝説"
 *   categories={['アクション', 'RPG']}
 *   onClick={() => router.push('/game/1')}
 *   onMouseEnter={() => handleHover('1')}
 *   onMouseLeave={handleLeave}
 * />
 * ```
 */
const GameCard: React.FC<GameCardProps> = memo(({
  title,
  categories = [],
  iconUrl,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isCenter = false,
  compact = false
}) => {
  // カテゴリに応じた背景グラデーション（コンパクトモード用）
  const getCategoryGradient = (cats: string[]): string => {
    if (cats.length === 0) {
      return "linear(to-br, gray.600, gray.900)";
    }
    return CATEGORY_GRADIENTS[cats[0]] ?? "linear(to-br, gray.600, gray.900)";
  };

  // コンパクトモード（横スクロール用）
  if (compact) {
    return (
      <Box
        position="relative"
        cursor={isCenter ? "pointer" : "default"}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        transition="all 0.2s ease"
        transform={isCenter ? "scale(1.08)" : "scale(1)"}
        _hover={{
          transform: "scale(1.04)",
          "&::before": {
            opacity: 1,
          },
        }}
        _before={{
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "lg",
          background: "linear-gradient(120deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05))",
          opacity: 0,
          transition: "opacity 0.2s ease",
          pointerEvents: "none",
          zIndex: 1,
        }}
        w="full"
        h="full"
      >
        <Box
          aria-label={title}
          bgGradient={iconUrl ? undefined : getCategoryGradient(categories)}
          backgroundImage={iconUrl ? `url(${iconUrl})` : undefined}
          backgroundSize="cover"
          backgroundPosition="center"
          rounded="lg"
          h="250px"
          w="full"
          position="relative"
          overflow="hidden"
          boxShadow={isCenter ? "0 14px 28px rgba(0,0,0,0.45)" : "0 6px 18px rgba(0,0,0,0.3)"}
          borderWidth={isCenter ? "2px" : "1px"}
          borderColor={isCenter ? "whiteAlpha.500" : "whiteAlpha.200"}
          transition="border-color 0.2s ease, box-shadow 0.2s ease"
          _hover={{
            borderColor: "whiteAlpha.400",
            boxShadow: "0 18px 32px rgba(0,0,0,0.5)",
          }}
        />
      </Box>
    );
  }

  // 通常モード（既存の表示）
  return (
    <Box
      bg="gray.800"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.700"
      _hover={{
        bg: "gray.700",
        transform: "translateY(-2px)",
      }}
      transition="all 0.2s"
      cursor={onClick ? "pointer" : "default"}
      overflow="hidden"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Box p={4}>
        <Stack direction="column" gap={3}>
          {/* ゲームアイコン */}
          <Box
            w="full"
            aspectRatio={1}
            bg="gray.700"
            rounded="lg"
            position="relative"
            overflow="hidden"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {iconUrl ? (
              <Image
                src={iconUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 45vw, 200px"
                style={{ objectFit: "cover" }}
                loading="lazy"
              />
            ) : (
              <Text fontSize="2xl">🎮</Text>
            )}
          </Box>

          {/* ゲームタイトル */}
          <Text 
            color="white"
            fontSize="sm"
            fontWeight="medium"
            textAlign="center"
          >
            {title}
          </Text>

          {/* カテゴリタグ */}
          <Flex gap={1} flexWrap="wrap" justify="center">
            {categories.map((cat: string) => (
              <Badge
                key={cat}
                colorScheme="blue"
                variant="subtle"
                fontSize="xs"
                px={2}
                py={1}
              >
                {cat}
              </Badge>
            ))}
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
});

GameCard.displayName = 'GameCard';

export default GameCard;
