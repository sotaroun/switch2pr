"use client";

import { useState, useRef, useLayoutEffect, useState as useStateReact } from "react";
import {
  Box,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import NextLink from "next/link";
import type { HeaderProps } from "@/types/headerType";

const MotionBox = motion(Box);

export const Header = ({ menus = [] }: HeaderProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerWidth, setHeaderWidth] = useStateReact<number>(0);

  useLayoutEffect(() => {
    if (headerRef.current) {
      setHeaderWidth(headerRef.current.offsetWidth);
    }
  }, []);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header
      ref={headerRef}
      className="flex justify-between p-4 bg-gray-800 relative"
    >
      <h1 className="text-white text-xl">GameReview Hub</h1>

      {menus.map((menu) => (
        <Popover.Root
          key={menu.menuLabel}
          open={openMenu === menu.menuLabel}
          onOpenChange={(isOpen) =>
            setOpenMenu(isOpen ? menu.menuLabel : null)
          }
        >
          <PopoverTrigger
            onMouseEnter={() => setOpenMenu(menu.menuLabel)}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <Link color="white" cursor="pointer">
              {menu.menuLabel}
            </Link>
          </PopoverTrigger>

          <PopoverContent
            position="absolute"
            top="100%" // ヘッダーの下に配置
            left={0}
            w={`${headerWidth}px`} // ヘッダー幅に合わせる
            borderRadius="0"
            mt={0}
            p={0}
            bg="white"
            shadow="md"
            onMouseEnter={() => setOpenMenu(menu.menuLabel)}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <MotionBox
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Box p={6}>
                {menu.menuLinks.map((link) => (
                  <Link
                    key={link.href}
                    as={NextLink}
                    href={link.href}
                    display="block"
                    mb={2}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </MotionBox>
          </PopoverContent>
        </Popover.Root>
      ))}
    </header>
  );
};
