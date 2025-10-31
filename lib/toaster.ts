"use client";

import { createToaster } from "@chakra-ui/react";

export const appToaster = createToaster({
  placement: "top-end",
  duration: 3500,
  gap: 16,
  max: 6,
});
