import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { SortTab } from "./types";

export type ReviewTableHeaderProps = BoxProps & {
  icon: ReactNode;
  title: string;
  subtitle: string;
  tabs: SortTab[];
};

export const ReviewTableHeader = ({ icon, title, subtitle, tabs, ...props }: ReviewTableHeaderProps) => (
  <Flex
    direction={{ base: "column", md: "row" }}
    justify="space-between"
    align={{ base: "flex-start", md: "center" }}
    gap={4}
    {...props}
  >
    <HStack align="flex-start" spacing={3}>
      <Box flexShrink={0}>{icon}</Box>
      <Box>
        <Text fontSize="xl" fontWeight="bold" color="whiteAlpha.900">
          {title}
        </Text>
        <Text fontSize="sm" color="rgba(140, 164, 255, 0.85)">
          {subtitle}
        </Text>
      </Box>
    </HStack>

    <HStack spacing={2}>
      {tabs.map((tab) => (
        <Button
          key={tab.label}
          size="sm"
          borderRadius="full"
          px={4}
          py={2}
          border="1px solid"
          borderColor={
            tab.isActive
              ? "rgba(92, 171, 255, 0.6)"
              : "rgba(255,255,255,0.14)"
          }
          bg={
            tab.isActive
              ? "linear(135deg, rgba(64, 149, 255, 0.45), rgba(39, 112, 255, 0.3))"
              : "rgba(255,255,255,0.04)"
          }
          color={tab.isActive ? "white" : "rgba(255,255,255,0.75)"}
          _hover={{
            bg: tab.isActive
              ? "linear(135deg, rgba(64, 149, 255, 0.6), rgba(39, 112, 255, 0.45))"
              : "rgba(255,255,255,0.08)",
            color: "white",
          }}
          cursor="default"
          fontWeight="semibold"
        >
          {tab.label}
        </Button>
      ))}
    </HStack>
  </Flex>
);
