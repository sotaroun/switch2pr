import { HStack, Icon, Text } from "@chakra-ui/react";
import type { HStackProps } from "@chakra-ui/react";
import { FaYoutube } from "react-icons/fa";

export type ChannelTagProps = HStackProps & {
  name: string;
};

export const ChannelTag = ({ name, ...props }: ChannelTagProps) => (
  <HStack
    as="span"
    spacing={2}
    px={3}
    py={1}
    borderRadius="full"
    bg="rgba(255, 71, 97, 0.22)"
    color="rgba(255, 236, 238, 0.96)"
    fontSize="xs"
    fontWeight="semibold"
    display="inline-flex"
    alignItems="center"
    border="1px solid rgba(255, 71, 97, 0.45)"
    {...props}
  >
    <Icon as={FaYoutube} boxSize={3.5} color="#ff3145" />
    <Text as="span">{name}</Text>
  </HStack>
);
