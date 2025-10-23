import React, { memo } from 'react';
import { Box, IconButton } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollButtonProps {
  direction: 'left' | 'right';
  onClick: () => void;
  isDisabled?: boolean;
}

/**
 * スクロール方向ボタン
 * 
 * @example
 * ```tsx
 * <ScrollButton direction="left" onClick={handleScrollLeft} />
 * ```
 */
const ScrollButton: React.FC<ScrollButtonProps> = memo(({
  direction,
  onClick,
  isDisabled = false
}) => {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

  return (
    <Box
      position="absolute"
      top="50%"
      transform="translateY(-50%)"
      zIndex={10}
      left={direction === 'left' ? 0 : 'auto'}
      right={direction === 'right' ? 0 : 'auto'}
    >
      <IconButton
        aria-label={direction === 'left' ? 'スクロール左' : 'スクロール右'}
        onClick={onClick}
        disabled={isDisabled}
        rounded="full"
        bg="whiteAlpha.900"
        color="gray.900"
        _hover={{
          bg: 'white',
          boxShadow: 'lg'
        }}
        _disabled={{
          bg: 'whiteAlpha.400',
          color: 'gray.500',
          cursor: 'not-allowed'
        }}
        transition="all 0.2s ease"
        size="lg"
      >
        <Icon size={24} />
      </IconButton>
    </Box>
  );
});

ScrollButton.displayName = 'ScrollButton';

export default ScrollButton;