"use client"

import { createToaster, Toaster as ChakraToaster } from "@chakra-ui/react"

export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
})

export const Toaster = ChakraToaster