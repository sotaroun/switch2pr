"use client";

import { Box, Stack } from "@chakra-ui/react";

import GameHeader from "@/components/molecules/GameHeader";
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

      <Box w="full" maxW={{ base: "960px", xl: "1200px" }}>
        <ReviewSwitcherTable />
      </Box>
    </Stack>
  );
}

export default GameDetailTemplate;
