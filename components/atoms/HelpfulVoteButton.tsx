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
    minW="34px"
    px={2}
    py={2}
    color="rgba(255, 230, 150, 0.95)"
    bg="transparent"
    borderRadius="999px"
    _hover={{
      transform: "translateY(-1px)",
      color: "rgba(255, 240, 190, 0.98)",
      bg: "rgba(255, 227, 140, 0.18)",
    }}
    _active={{ transform: "translateY(0)" }}
    _disabled={{
      opacity: 0.55,
      cursor: "default",
      transform: "none",
      bg: "transparent",
      color: "rgba(255, 230, 150, 0.75)",
    }}
    {...props}
  >
    <HStack spacing={2} align="center">
      <Icon as={LuThumbsUp} boxSize={4.5} color="inherit" />
      <Text as="span" fontSize="sm" fontWeight="semibold" color="inherit">
        {count}
      </Text>
    </HStack>
  </Button>
);
