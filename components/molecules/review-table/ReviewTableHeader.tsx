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
        <Text fontSize="xl" fontWeight="bold" color="rgba(255, 255, 255, 0.95)">
          {title}
        </Text>
        <Text fontSize="sm" color="rgba(255, 255, 255, 0.6)">
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
          borderColor="rgba(255, 255, 255, 0.16)"
          bg={tab.isActive ? "rgba(255, 255, 255, 0.16)" : "rgba(255, 255, 255, 0.04)"}
          color={tab.isActive ? "rgba(255, 255, 255, 0.95)" : "rgba(255,255,255,0.7)"}
          onClick={tab.onClick}
          _hover={{
            bg: "rgba(255, 255, 255, 0.12)",
            color: "rgba(255, 255, 255, 0.95)",
          }}
          cursor={tab.onClick ? "pointer" : "default"}
          fontWeight="semibold"
        >
          {tab.label}
        </Button>
      ))}
    </HStack>
  </Flex>
);
