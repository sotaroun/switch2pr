import { Button, HStack, Icon, Text } from "@chakra-ui/react";
import type { ButtonProps } from "@chakra-ui/react";
import { LuThumbsUp } from "react-icons/lu";

export type HelpfulVoteButtonProps = ButtonProps & {
  count: number;
};

export const HelpfulVoteButton = ({ count, ...props }: HelpfulVoteButtonProps) => (
  <Button
    variant="ghost"
    size="sm"
    display="inline-flex"
    alignItems="center"
    justifyContent="center"
    minW="42px"
    px={2}
    py={2}
    borderRadius="999px"
    color="rgba(255, 255, 255, 0.75)"
    bg="transparent"
    _hover={{
      transform: "translateY(-1px)",
      color: "rgba(255, 255, 255, 0.95)",
      bg: "rgba(255, 255, 255, 0.16)",
    }}
    _active={{ transform: "translateY(0)" }}
    _disabled={{
      opacity: 0.55,
      cursor: "default",
      transform: "none",
      bg: "transparent",
      color: "rgba(255, 255, 255, 0.45)",
    }}
    {...props}
  >
    <HStack gap={2} align="center">
      <Icon as={LuThumbsUp} boxSize={4} color="inherit" />
      <Text as="span" fontSize="sm" fontWeight="semibold" color="inherit">
        {count}
      </Text>
    </HStack>
  </Button>
);
