import React, { memo } from 'react';
import { Box, Stack, Text, Flex, Badge } from "@chakra-ui/react";

interface GameCardProps {
  title: string;
  categories: string[];
  iconUrl?: string;
  onClick?: () => void;
  /** ホバー開始時のハンドラー */
  onMouseEnter?: () => void;
  /** ホバー終了時のハンドラー */
  onMouseLeave?: () => void;
}

/**
 * ゲームカード表示のMoleculeコンポーネント
 * オーバーレイコメント対応版
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
  categories,
  iconUrl,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
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
            {categories.map(cat => (
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
