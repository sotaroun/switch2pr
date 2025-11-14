"use client";

import React, { useState } from "react";
import {
  Box,
  Flex,
  Link as ChakraLink,
  IconButton,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu as MenuIcon, X as XIcon } from "lucide-react";
import NextLink from "next/link";
import type { HeaderProps, Menu, MenuLink } from "@/types/headerType";
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
  const maxOffset = hoverAmplify ? 6 : 2;
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

            <motion.span
              className="absolute left-0 bottom-0 h-[3px] w-0 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded"
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          </motion.h1>
        </ChakraLink>

        {/* デスクトップメニュー */}
        <Flex
          gap={10}
          display={{ base: "none", md: "flex" }}
          align="center"
          position="relative"
        >
          <style jsx global>{`
            @keyframes neonLine {
              0% {
                box-shadow: 0 0 2px rgba(229, 9, 20, 0.2);
              }
              100% {
                box-shadow: 0 0 12px rgba(229, 9, 20, 0.9);
              }
            }
            @keyframes flicker {
              0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
                opacity: 1;
              }
              20%, 24%, 55% {
                opacity: 0.6;
              }
            }
          `}</style>

          {menus.map((menu: Menu, i) => {
            const firstHref = menu.href ?? menu.menuLinks?.[0]?.href ?? "#";

            return (
              <MotionBox
                key={menu.menuLabel}
                position="relative"
                onMouseEnter={() => setHoveredMenu(menu.menuLabel)}
                onMouseLeave={() => setHoveredMenu(null)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <ChakraLink
                  as={NextLink}
                  href={firstHref}
                  fontSize="lg"
                  fontWeight="600"
                  letterSpacing="0.05em"
                  color="white"
                  textShadow="0 0 8px rgba(255,255,255,0.6)"
                  animation="flicker 4s infinite"
                  _hover={{
                    color: "#E50914",
                    textShadow: "0 0 20px rgba(229,9,20,1)",
                    transform: "scale(1.05)",
                  }}
                  transition="all 0.25s ease"
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
                  borderRadius="2px"
                  transition={{ duration: 0.25 }}
                  style={{
                    animation:
                      hoveredMenu === menu.menuLabel
                        ? "neonLine 0.8s alternate infinite"
                        : "none",
                  }}
                />
              </MotionBox>
            );
          })}
        </Flex>

        {/* モバイル：ハンバーガー */}
        <Box display={{ base: "block", md: "none" }}>
          <IconButton
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((s) => !s)}
            variant="ghost"
            _hover={{ bg: "rgba(255,255,255,0.08)", color: "#fff" }}
            color="#ddd"
            fontSize="22px"
            transition="all 0.3s ease"
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      </Flex>

      {/* モバイルメニュー */}
      <AnimatePresence>
        {mobileOpen && (
          <MotionBox
            initial={{ opacity: 0, y: -30, scale: 0.98 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              boxShadow: "0 0 25px rgba(229, 9, 20, 0.4)",
            }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            position="absolute"
            top="80px"
            right="0"
            left="0"
            bg="rgba(10, 10, 10, 0.92)"
            backdropFilter="blur(10px)"
            zIndex={50}
            borderTop="1px solid rgba(255, 255, 255, 0.08)"
            px={4}
            py={6}
            borderRadius="md"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgGradient="radial(rgba(229,9,20,0.25), transparent 70%)"
              animation="pulse 3s infinite alternate"
              pointerEvents="none"
            />

            <style jsx global>{`
              @keyframes pulse {
                0% {
                  opacity: 0.1;
                  transform: scale(1);
                }
                100% {
                  opacity: 0.4;
                  transform: scale(1.05);
                }
              }
            `}</style>

            {menus.map((menu: Menu) => {
              const firstHref = menu.href ?? menu.menuLinks?.[0]?.href ?? "#";

              return menu.menuLinks ? (
                <Box key={menu.menuLabel} mb={5}>
                  <ChakraLink
                    as={NextLink}
                    href={firstHref}
                    fontSize="xl"
                    display="block"
                    mb={2}
                    onClick={() => setMobileOpen(false)}
                    color="white"
                    fontWeight="bold"
                    letterSpacing="0.05em"
                    textShadow="0 0 10px rgba(255,255,255,0.7)"
                    _hover={{
                      color: "#E50914",
                      textShadow: "0 0 20px rgba(229,9,20,1)",
                      transform: "scale(1.05)",
                    }}
                    transition="all 0.3s ease"
                  >
                    {menu.menuLabel}
                  </ChakraLink>

                  <Box pl={3}>
                    {menu.menuLinks.map((l: MenuLink) => (
                      <ChakraLink
                        as={NextLink}
                        key={l.href}
                        href={l.href}
                        display="block"
                        mb={2}
                        fontSize="md"
                        onClick={() => setMobileOpen(false)}
                        color="whiteAlpha.800"
                        textShadow="0 0 6px rgba(255,255,255,0.4)"
                        _hover={{
                          color: "#E50914",
                          textShadow: "0 0 15px rgba(229,9,20,0.9)",
                          transform: "translateX(4px)",
                        }}
                        transition="all 0.3s ease"
                      >
                        {l.label}
                      </ChakraLink>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box key={menu.menuLabel} mb={5}>
                  <ChakraLink
                    as={NextLink}
                    href={firstHref}
                    fontSize="xl"
                    display="block"
                    onClick={() => setMobileOpen(false)}
                    color="white"
                    fontWeight="bold"
                    letterSpacing="0.05em"
                    textShadow="0 0 10px rgba(255,255,255,0.7)"
                    _hover={{
                      color: "#E50914",
                      textShadow: "0 0 20px rgba(229,9,20,1)",
                      transform: "scale(1.05)",
                    }}
                    transition="all 0.3s ease"
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
