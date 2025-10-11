import { Icon } from "@chakra-ui/react";
import type { IconProps } from "@chakra-ui/react";

export type YouTubeIconProps = IconProps & {
  accentColor?: string;
  bodyColor?: string;
};

export const YouTubeIcon = ({
  accentColor = "#0b1027",
  bodyColor = "transparent",
  ...props
}: YouTubeIconProps) => (
  <Icon viewBox="0 0 32 24" stroke="currentColor" strokeWidth={1.6} {...props}>
    <rect x={1.2} y={2.3} width={29.6} height={19.4} rx={6.5} fill={bodyColor} />
    <path d="M13 17.5V6.5l8 5.5-8 5.5Z" fill={accentColor} stroke="none" />
  </Icon>
);
