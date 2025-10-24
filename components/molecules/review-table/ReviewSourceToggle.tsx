import { Box, Button, HStack } from "@chakra-ui/react";
import { BubbleIcon } from "@/components/atoms/icons/BubbleIcon";
import { YouTubeIcon } from "@/components/atoms/icons/YouTubeIcon";
import { tabButtonThemes, tabLabels, tabOrder } from "./config";
import type { ReviewTabKey } from "./types";

type ReviewSourceToggleProps = {
  value: ReviewTabKey;
  onChange: (next: ReviewTabKey) => void;
};

const renderIcon = (source: ReviewTabKey, active: boolean) => {
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

  if (source === "form") {
    return null;
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
    bg="rgba(255, 255, 255, 0.06)"
    boxShadow="0 12px 32px rgba(0, 0, 0, 0.4)"
    p="1"
  >
    <HStack
      spacing={2}
      bg="rgba(32, 32, 32, 0.95)"
      borderRadius="full"
      px={2.5}
      py={1.5}
    >
      {tabOrder.map((key) => {
        const active = value === key;
        const theme = tabButtonThemes[key];
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
            {tabLabels[key]}
          </Button>
        );
      })}
    </HStack>
  </Box>
);
