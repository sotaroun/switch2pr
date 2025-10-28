"use client";

import React, { useState } from "react";
import {
  Box,
  Flex,
  Link as ChakraLink,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu as MenuIcon, X as XIcon } from "lucide-react";
import NextLink from "next/link";
import type { HeaderProps } from "@/types/headerType";
import { Orbitron } from "next/font/google";

const MotionBox = motion(Box);

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700"] });

// グリッチレイヤーコンポーネント
const GlitchLayer = ({
  children,
  color,
  hoverAmplify = false,
}: {
  children: React.ReactNode;
  color: string;
  hoverAmplify?: boolean;
}) => {
  const maxOffset = hoverAmplify ? 6 : 2; // ホバー時は最大6pxに増幅
  const duration = hoverAmplify ? 0.25 : 0.5;

  const randomX = Math.floor(Math.random() * (maxOffset * 2 + 1) - maxOffset);
  const randomY = Math.floor(Math.random() * (maxOffset * 2 + 1) - maxOffset);

  return (
    <motion.span
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        color,
        mixBlendMode: "screen",
        textShadow: `0 0 ${hoverAmplify ? 8 : 4}px ${color}, 0 0 ${
          hoverAmplify ? 14 : 12
        }px ${color}`,
      }}
      animate={{ x: [0, randomX, -randomX, 0], y: [0, randomY, -randomY, 0] }}
      transition={{ repeat: Infinity, duration, ease: "easeInOut" }}
    >
      {children}
    </motion.span>
  );
};

export const Header = ({ menus = [] }: HeaderProps) => {
  const [hoveredTitle, setHoveredTitle] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDesktop = useBreakpointValue({ base: false, md: true });

  return (
    <header>
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        px={{ base: 4, md: 10 }}
        h="80px"
        bg="black"
        color="white"
      >
        {/* サイトタイトル */}
        <ChakraLink
          as={NextLink}
          href="/"
          className="group relative"
          onMouseEnter={() => setHoveredTitle(true)}
          onMouseLeave={() => setHoveredTitle(false)}
        >
          <motion.h1
            className={`${orbitron.className} text-3xl md:text-4xl font-extrabold tracking-wide relative flex items-center gap-2`}
            animate={{
              y: [0, -2, 2, 0],
              x: [0, 1, -1, 0],
              textShadow: [
                "0 0 6px #ff004c, 0 0 10px #ff004c",
                "0 0 10px #ff00ff, 0 0 15px #ff00ff",
                "0 0 8px #00ffff, 0 0 12px #00ffff",
                "0 0 6px #ff004c, 0 0 10px #ff004c",
              ],
            }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <motion.span
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1 }}
              className="text-red-600"
            >
              🎮
            </motion.span>

            {/* メイン文字 */}
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 drop-shadow-[0_0_12px_rgba(255,0,100,0.8)]">
              GAME REVIEW HUB
              <GlitchLayer color="#0ff" hoverAmplify={hoveredTitle}>
                GAME REVIEW HUB
              </GlitchLayer>
              <GlitchLayer color="#f0f" hoverAmplify={hoveredTitle}>
                GAME REVIEW HUB
              </GlitchLayer>
              <GlitchLayer color="#ff0" hoverAmplify={hoveredTitle}>
                GAME REVIEW HUB
              </GlitchLayer>
            </span>

            {/* 下線 */}
            <motion.span
              className="absolute left-0 bottom-0 h-[3px] w-0 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded"
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          </motion.h1>
        </ChakraLink>

        {/* デスクトップメニュー */}
        <Flex gap={8} display={{ base: "none", md: "flex" }}>
          {menus.map((menu: any) => {
            const firstHref =
              (menu && (menu.href as string)) ??
              (menu?.menuLinks && menu.menuLinks[0]?.href) ??
              "#";

            return (
              <Box
                key={menu.menuLabel}
                position="relative"
                onMouseEnter={() => setHoveredMenu(menu.menuLabel)}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <ChakraLink
                  as={NextLink}
                  href={firstHref}
                  fontSize="md"
                  fontWeight="500"
                  color="white"
                  _hover={{ textDecoration: "none", color: "#E50914" }}
                >
                  {menu.menuLabel}
                </ChakraLink>

                <MotionBox
                  position="absolute"
                  bottom="-6px"
                  left="0"
                  height="2px"
                  width={hoveredMenu === menu.menuLabel ? "100%" : "0%"}
                  bg="#E50914"
                  transition={{ duration: 0.18 }}
                />
              </Box>
            );
          })}
        </Flex>

        {/* モバイル：ハンバーガー */}
        <Box display={{ base: "block", md: "none" }}>
          <IconButton
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((s) => !s)}
            variant="ghost"
            _hover={{ bg: "rgba(255,255,255,0.04)" }}
            fontSize="20px"
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      </Flex>

      {/* モバイルメニュー */}
      <AnimatePresence>
        {mobileOpen && (
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            position="absolute"
            top="80px"
            right="0"
            left="0"
            bg="black"
            zIndex={50}
            borderTop="1px solid rgba(255,255,255,0.04)"
            px={4}
            py={6}
          >
            {menus.map((menu: any) => {
              const firstHref =
                (menu && (menu.href as string)) ??
                (menu?.menuLinks && menu.menuLinks[0]?.href) ??
                "#";

              return menu.menuLinks ? (
                <Box key={menu.menuLabel} mb={4}>
                  <ChakraLink
                    as={NextLink}
                    href={firstHref}
                    fontSize="lg"
                    display="block"
                    mb={2}
                    onClick={() => setMobileOpen(false)}
                    color="white"
                    _hover={{ color: "#E50914" }}
                  >
                    {menu.menuLabel}
                  </ChakraLink>

                  <Box pl={2}>
                    {menu.menuLinks.map((l: any) => (
                      <ChakraLink
                        as={NextLink}
                        key={l.href}
                        href={l.href}
                        display="block"
                        mb={2}
                        fontSize="sm"
                        onClick={() => setMobileOpen(false)}
                        color="white"
                        _hover={{ color: "#E50914" }}
                      >
                        {l.label}
                      </ChakraLink>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box key={menu.menuLabel} mb={4}>
                  <ChakraLink
                    as={NextLink}
                    href={firstHref}
                    fontSize="lg"
                    display="block"
                    onClick={() => setMobileOpen(false)}
                    color="white"
                    _hover={{ color: "#E50914" }}
                  >
                    {menu.menuLabel}
                  </ChakraLink>
                </Box>
              );
            })}
          </MotionBox>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
