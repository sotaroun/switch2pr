import { Icon } from "@chakra-ui/react";
import type { IconProps } from "@chakra-ui/react";

export const BubbleIcon = (props: IconProps) => (
  <Icon
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    {...props}
  >
    <path
      d="M5.5 5.5h13a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-4.3L9 18.4a.5.5 0 0 1-.7-.5v-2.4H5.5a1.5 1.5 0 0 1-1.5-1.5V7a1.5 1.5 0 0 1 1.5-1.5Z"
      strokeLinejoin="round"
    />
  </Icon>
);
