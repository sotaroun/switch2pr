import React, { memo } from 'react';
import { Box, Text, Spinner } from "@chakra-ui/react";

interface PageLoaderProps {
  /** ローディング中かどうか */
  isLoading: boolean;
}

/**
 * ページ全体のローディング画面
 * 
 * @example
 * ```tsx
 * <PageLoader isLoading={isPageLoading} />
 * ```
 */
const PageLoader: React.FC<PageLoaderProps> = memo(({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.95)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={10000}
    >
      <Box textAlign="center">
        <Spinner
          size="xl"
          color="blue.500"
          mb={6}
        />
        <Text color="white" fontSize="2xl" fontWeight="bold">
          読み込み中...
        </Text>
      </Box>
    </Box>
  );
});

PageLoader.displayName = 'PageLoader';

export default PageLoader;