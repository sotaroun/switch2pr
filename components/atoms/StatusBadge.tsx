import { Box } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";

export type StatusBadgeProps = BoxProps & {
  status: string;
};

export const StatusBadge = ({ status, ...props }: StatusBadgeProps) => (
  <Box
    as="span"
    px={3.5}
    py={0.75}
    borderRadius="full"
    bg="#119B44"
    border="1px solid rgba(8, 88, 40, 0.95)"
    color="rgba(255, 255, 255, 0.92)"
    fontWeight="semibold"
    fontSize="xs"
    display="inline-flex"
    alignItems="center"
    justifyContent="center"
    minW="64px"
    {...props}
  >
    {status}
  </Box>
);
