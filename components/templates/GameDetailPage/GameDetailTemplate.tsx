"use client";

import { Box, Flex, Stack } from "@chakra-ui/react";

import GameHeader from "@/components/molecules/GameHeader";
import { QuickReviewForm } from "@/components/organisms/QuickReviewForm";
import ReviewSwitcherTable from "@/components/organisms/ReviewSwitcherTable";

export function GameDetailTemplate() {
  return (
    <Stack
      spacing={{ base: 6, xl: 8 }}
      w="full"
      align="center"
      py={{ base: 6, md: 10 }}
      px={{ base: 4, md: 8 }}
    >
      <Box w="full" maxW="960px">
        <GameHeader />
      </Box>

      <Flex
        w="full"
        maxW={{ base: "960px", xl: "1200px" }}
        direction={{ base: "column", xl: "row" }}
        align={{ base: "stretch", xl: "flex-start" }}
        gap={{ base: 6, xl: 8 }}
      >
        <Box flex="1" minW="0">
          <ReviewSwitcherTable />
        </Box>
        <Box
          w={{ base: "full", xl: "360px" }}
          flexShrink={0}
          position={{ base: "static", xl: "sticky" }}
          top={{ base: "auto", xl: "96px" }}
        >
          <QuickReviewForm />
        </Box>
      </Flex>
    </Stack>
  );
}

export default GameDetailTemplate;
