// atoms/Loading/Spinner.tsx

import React from 'react';
import { Box, Spinner as ChakraSpinner, Text, Stack } from "@chakra-ui/react";

interface SpinnerProps {
  /** サイズ */
  size?: "sm" | "md" | "lg" | "xl";
  /** 表示メッセージ */
  message?: string;
  /** 色 */
  color?: string;
}

/**
 * ローディングスピナーのAtomコンポーネント
 * 
 * @example
 * ```tsx
 * <Spinner size="lg" message="読み込み中..." />
 * ```
 */
const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  message,
  color = "blue.500"
}) => {
  return (
    <Box textAlign="center" py={4}>
      <Stack direction="column" gap={3} alignItems="center">
        <ChakraSpinner
          size={size}
          color={color}
        />
        {message && (
          <Text color="gray.400" fontSize="sm">
            {message}
          </Text>
        )}
      </Stack>
    </Box>
  );
};

export default Spinner;