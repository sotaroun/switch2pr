import React, { memo } from 'react';
import { Box, Skeleton, VStack } from "@chakra-ui/react";

interface CardSkeletonProps {
  count?: number;
}

/**
 * カードスケルトンローダー
 * 読み込み中の状態を表示
 */
const CardSkeleton: React.FC<CardSkeletonProps> = memo(({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          flex="0 0 auto"
          rounded="lg"
          overflow="hidden"
        >
          <VStack gap={0} h="200px" w="full">
            <Skeleton h="70%" w="full" />
            <Skeleton h="30%" w="full" />
          </VStack>
        </Box>
      ))}
    </>
  );
});

CardSkeleton.displayName = 'CardSkeleton';

export default CardSkeleton;