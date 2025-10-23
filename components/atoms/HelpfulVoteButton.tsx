import { Button, Icon, Text } from "@chakra-ui/react";
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
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minW="44px"
    py={1}
    color="rgba(255, 255, 255, 0.75)"
    bg="transparent"
    _hover={{
      transform: "translateY(-1px)",
      color: "rgba(255, 255, 255, 0.95)",
      bg: "rgba(255, 255, 255, 0.12)",
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
    <Icon as={LuThumbsUp} boxSize={4.5} color="currentColor" />
    <Text as="span" fontSize="xs" fontWeight="semibold" mt={1} color="inherit">
      {count}
    </Text>
  </Button>
);
