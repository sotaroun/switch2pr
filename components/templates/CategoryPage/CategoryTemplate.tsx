import React from 'react';
import {
  Box,
  Container,
  Stack,
  Heading,
  Text,
  Grid,
  Center,
  Badge,
  Flex
} from "@chakra-ui/react";
import CategoryFilterOrg from '../../organisms/SearchSection/CategoryFilters';
import GameCard from '../../molecules/GameCard/GameCard'; // GameCardのパスは環境に合わせて変更

interface Game {
  id: string;
  title: string;
  categories: string[];
  iconUrl: string;
}

interface CategoryTemplateProps {
  categories: string[];
  selectedCategories: string[];
  filteredGames: Game[];
  onCategoryToggle: (category: string) => void;
  onReset: () => void;
}

const CategoryTemplate: React.FC<CategoryTemplateProps> = ({
  categories,
  selectedCategories,
  filteredGames,
  onCategoryToggle,
  onReset
}) => {
  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Container maxW="90%" py={8}>
        <Stack direction="column" gap={8}>
          {/* ヘッダー */}
          <Stack direction="column" gap={4} textAlign="center">
            <Heading 
              as="h1" 
              fontSize={{ base: "3xl", md: "5xl" }} 
              color="white"
            >
              カテゴリから探す
            </Heading>
            <Text color="gray.400" fontSize="lg">
              お好みのジャンルでゲームを絞り込み
            </Text>
          </Stack>
          
          {/* カテゴリフィルター */}
          <CategoryFilterOrg
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryToggle={onCategoryToggle}
            onReset={onReset}
          />
          
          {/* ゲーム一覧 */}
          <Box w="full">
            <Stack direction="column" gap={6}>
              <Box textAlign="center">
                <Heading as="h2" size="lg" color="white" mb={2}>
                  ゲーム一覧 ({filteredGames.length}件)
                </Heading>
              </Box>
              
              {filteredGames.length > 0 ? (
                <Grid 
                  templateColumns={{ 
                    base: "repeat(2, 1fr)", 
                    md: "repeat(4, 1fr)", 
                    lg: "repeat(5, 1fr)" 
                  }} 
                  gap={6} 
                  w="full"
                >
                  {filteredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      title={game.title}
                      categories={game.categories}
                      iconUrl={game.iconUrl}
                      onClick={() => console.log(`${game.title} clicked`)}
                    />
                  ))}
                </Grid>
              ) : (
                <Center py={12} textAlign="center">
                  <Stack direction="column" gap={4}>
                    <Text color="gray.400" fontSize="lg">
                      条件に合うゲームがありません
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      別のカテゴリを選択してください
                    </Text>
                  </Stack>
                </Center>
              )}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default CategoryTemplate;
