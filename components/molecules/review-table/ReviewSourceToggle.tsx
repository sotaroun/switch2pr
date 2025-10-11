import { Box, Button, HStack } from "@chakra-ui/react";
import { BubbleIcon } from "../../atoms/icons/BubbleIcon";
import { YouTubeIcon } from "../../atoms/icons/YouTubeIcon";
import { sourceButtonThemes, sourceLabels, sourceOrder } from "./config";
import type { Source } from "./types";

type ReviewSourceToggleProps = {
  value: Source;
  onChange: (next: Source) => void;
};

const renderIcon = (source: Source, active: boolean) => {
  if (source === "youtube") {
    return (
      <YouTubeIcon
        boxSize="1.5em"
        color={active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)"}
        bodyColor={active ? "#ff3145" : "transparent"}
        accentColor={active ? "#ffffff" : "#2bc3ff"}
      />
    );
  }

  return (
    <BubbleIcon
      boxSize="1.35em"
      color={active ? "white" : "rgba(255,255,255,0.65)"}
    />
  );
};

export const ReviewSourceToggle = ({ value, onChange }: ReviewSourceToggleProps) => (
  <Box
    borderRadius="full"
    width="fit-content"
    bgGradient="linear(135deg, rgba(56, 198, 255, 0.45), rgba(32, 128, 255, 0.15))"
    boxShadow="0 12px 35px rgba(32, 178, 255, 0.28)"
    p="1"
  >
    <HStack
      spacing={2}
      bg="rgba(10, 16, 40, 0.92)"
      borderRadius="full"
      px={2.5}
      py={1.5}
    >
      {sourceOrder.map((key) => {
        const active = value === key;
        const theme = sourceButtonThemes[key];
        return (
          <Button
            key={key}
            onClick={() => onChange(key)}
            variant="solid"
            leftIcon={renderIcon(key, active)}
            borderRadius="full"
            px={4}
            py={2}
            fontWeight="semibold"
            fontSize="sm"
            color={active ? theme.activeColor : theme.idleColor}
            bg={active ? theme.activeBg : theme.idleBg}
            boxShadow={active ? theme.shadow : "none"}
            _hover={{
              color: active ? theme.activeColor : theme.hoverColor,
              bg: active ? theme.activeBg : theme.hoverBg,
            }}
            _active={{
              transform: "scale(0.97)",
              bg: theme.activeBg,
              color: theme.activeColor,
            }}
            transition="all 0.2s ease"
            gap={2.5}
          >
            {sourceLabels[key]}
          </Button>
        );
      })}
    </HStack>
  </Box>
);
