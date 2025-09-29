// atoms/Button/CategoryButton.tsx
import React from 'react';
import { Button, Text } from "@chakra-ui/react";

interface CategoryButtonProps {
  category: string;
  isSelected: boolean;
  isAnimating: boolean;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  animationDelay?: string;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({
  category,
  isSelected,
  isAnimating,
  onClick,
  onKeyDown,
  animationDelay
}) => {
  return (
    <Button
      onClick={onClick}
      onKeyDown={onKeyDown}
      size="md"
      variant={isSelected ? "solid" : "outline"}
      colorScheme={isSelected ? "blue" : "gray"}
      bg={isSelected ? "blue.500" : "gray.700"}
      color={isSelected ? "white" : "gray.300"}
      borderColor={isSelected ? "blue.500" : "gray.600"}
      _hover={{
        bg: isSelected ? "blue.600" : "gray.600",
        color: "white",
        transform: "scale(1.05)",
      }}
      transform={isAnimating ? (isSelected ? "scale(1.05)" : "scale(0.95)") : "scale(1)"}
      transition="all 0.3s ease"
      style={{
        animationDelay: animationDelay || "0ms"
      }}
    >
      <Text fontSize="sm" fontWeight="medium">
        {category}
      </Text>
    </Button>
  );
};

export default CategoryButton;


