import React, { memo } from 'react';
import { Box, Spinner as ChakraSpinner, Text, Stack } from "@chakra-ui/react";

interface SpinnerProps {
  /** スピナーのサイズ */
  size?: "sm" | "md" | "lg" | "xl";
  /** 表示メッセージ */
  message?: string;
  /** スピナーの色 */
  color?: string;
}

/**
 * ローディングスピナーのAtomコンポーネント
 * メッセージ付きでローディング状態を表示
 * 
 * @example
 * ```tsx
 * <Spinner size="lg" message="読み込み中..." color="blue.500" />
 * ```
 */
const Spinner: React.FC<SpinnerProps> = memo(({
  size = "md",
  message,
  color = "blue.500"
}) => {
  return (
    <Box textAlign="center" py={4} role="status" aria-live="polite" aria-busy="true">
      <Stack direction="column" gap={3} alignItems="center">
        <ChakraSpinner
          size={size}
          color={color}
          aria-label="読み込み中"
        />
        {message && (
          <Text color="gray.400" fontSize="sm">
            {message}
          </Text>
        )}
      </Stack>
    </Box>
  );
});

Spinner.displayName = 'Spinner';

export default Spinner;