// import React, { memo } from 'react';
// import { Box, Text, VStack } from "@chakra-ui/react";
// import { Game } from '../../types/game';

// interface GameCardProps {
//   game: Game;
//   isCenter?: boolean;
//   onClick?: () => void;
// }

// /**
//  * ゲームカード表示コンポーネント
//  * 
//  * @example
//  * ```tsx
//  * <GameCard game={game} onClick={() => handleClick(game.id)} />
//  * ```
//  */
// const GameCard: React.FC<GameCardProps> = memo(({ 
//   game, 
//   isCenter = false,
//   onClick 
// }) => {
//   // カテゴリに応じた背景色を決定
//   const getBgColor = (categories: string[]): string => {
//     const colorMap: Record<string, string> = {
//       'アクション': 'from-red-600 to-red-900',
//       'RPG': 'from-purple-600 to-purple-900',
//       'シューティング': 'from-blue-600 to-blue-900',
//       'スポーツ': 'from-green-600 to-green-900',
//       'パズル': 'from-yellow-600 to-yellow-900'
//     };
    
//     const category = categories[0] || 'アクション';
//     return colorMap[category] || 'from-gray-600 to-gray-900';
//   };

//   const bgGradient = getBgColor(game.categories);

//   return (
//     <Box
//       flex="0 0 auto"
//       position="relative"
//       cursor={isCenter ? 'pointer' : 'default'}
//       onClick={onClick}
//       transition="all 0.3s ease"
//       transform={isCenter ? 'scale(1.1)' : 'scale(1)'}
//       _hover={isCenter ? { transform: 'scale(1.15)' } : undefined}
//     >
//       {/* カード背景 */}
//       <VStack
//         bg={`linear-gradient(135deg, var(--color-${bgGradient.split(' ')[1]}, #2d3748))`}
//         bgGradient={bgGradient}
//         rounded="lg"
//         p={4}
//         h="200px"
//         w="full"
//         justify="flex-end"
//         align="center"
//         position="relative"
//         overflow="hidden"
//         boxShadow={isCenter ? 'xl' : 'md'}
//         borderWidth={isCenter ? '2px' : '0px'}
//         borderColor={isCenter ? 'white' : 'transparent'}
//       >
//         {/* グラデーションオーバーレイ */}
//         <Box
//           position="absolute"
//           top={0}
//           left={0}
//           right={0}
//           bottom={0}
//           bgGradient="linear(to-t, rgba(0,0,0,0.8), rgba(0,0,0,0))"
//           zIndex={1}
//         />

//         {/* テキストコンテンツ */}
//         <VStack
//           zIndex={2}
//           gap={2}
//           textAlign="center"
//           w="full"
//         >
//           <Text
//             fontSize="sm"
//             color="whiteAlpha.700"
//             fontWeight="500"
//             textTransform="uppercase"
//             letterSpacing="wider"
//           >
//             {game.categories[0]}
//           </Text>
//           <Text
//             fontSize={isCenter ? 'md' : 'sm'}
//             fontWeight="bold"
//             color="white"
//             lineHeight="tight"
//             lineClamp={isCenter ? 3 : 2}
//             transition="font-size 0.3s ease"
//           >
//             {game.title}
//           </Text>
//         </VStack>
//       </VStack>

//       {/* 非クリック可能時のオーバーレイ */}
//       {!isCenter && (
//         <Box
//           position="absolute"
//           inset={0}
//           rounded="lg"
//           bg="blackAlpha.300"
//           zIndex={3}
//           transition="background-color 0.3s ease"
//           _groupHover={{
//             bg: 'blackAlpha.0'
//           }}
//         />
//       )}
//     </Box>
//   );
// });

// GameCard.displayName = 'GameCard';

// export default GameCard;