import React from "react";
import { Button, Icon, type ButtonProps } from "@chakra-ui/react";
import { IconType } from "react-icons";

interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  colorScheme: string;
  icon?: IconType;
  size?: ButtonProps["size"]; // ✅ Button の size 型を利用
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  onKeyDown,
  colorScheme,
  icon,
  size = "lg",
}) => {
  return (
    <Button
      onClick={onClick}
      onKeyDown={onKeyDown}
      colorScheme={colorScheme}
      variant="solid"
      bg={`${colorScheme}.600`}
      _hover={{
        bg: `${colorScheme}.700`,
        transform: "scale(1.05)",
      }}
      size={size}
      transition="all 0.2s"
    >
      {icon && <Icon as={icon} mr={2} />}
      {children}
    </Button>
  );
};

export default ActionButton;
