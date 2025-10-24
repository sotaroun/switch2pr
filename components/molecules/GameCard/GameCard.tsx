import React, { memo } from 'react';
import { Box, Stack, Text, Flex, Badge } from "@chakra-ui/react";
import { CATEGORY_GRADIENTS } from "./constants";

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
          bgGradient={iconUrl ? undefined : getCategoryGradient(categories)}
          backgroundImage={iconUrl ? `url(${iconUrl})` : undefined}
          backgroundSize="cover"
          backgroundPosition="center"
          rounded="lg"
          p={4}
          h="250px"
          w="full"
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          alignItems="center"
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
        >
          {/* グラデーションオーバーレイ */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgGradient="linear(to-t, blackAlpha.800, blackAlpha.0)"
            zIndex={1}
          />

          {/* テキストコンテンツ */}
          <Stack
            direction="column"
            gap={2}
            textAlign="center"
            w="full"
            zIndex={2}
          >
            <Text
              fontSize="sm"
              color="whiteAlpha.700"
              fontWeight="500"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              {categories[0] || 'ゲーム'}
            </Text>
            <Text
              fontSize={isCenter ? 'md' : 'sm'}
              fontWeight="bold"
              color="white"
              lineHeight="tight"
              lineClamp={isCenter ? 3 : 2}
              transition="font-size 0.3s ease"
            >
              {title}
            </Text>
          </Stack>

          {/* 非クリック可能時のオーバーレイ */}
          {!isCenter && (
            <Box
              position="absolute"
              inset={0}
              rounded="lg"
              bg="blackAlpha.300"
              zIndex={3}
              transition="background-color 0.3s ease"
            />
          )}
        </Box>
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
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {iconUrl ? (
              <img 
                src={iconUrl} 
                alt={title} 
                style={{ width: '50%', height: '50%', objectFit: 'cover' }} 
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
