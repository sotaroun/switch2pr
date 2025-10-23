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
      justify="flex-start"
      minH="100vh"
      py={{ base: 6, md: 10 }}
      px={{ base: 4, md: 8 }}
      bg="#050505"
      color="rgba(243, 244, 246, 0.92)"
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
