"use client"
import React from 'react';
import { Box, Container, Stack, Heading } from "@chakra-ui/react";
import SearchWithResults from '../components/organisms/SearchSection/SearchWithResults';

const HomePage: React.FC = () => {
  // ダミーゲームデータ（10件）
  const dummyGames = [
    { id: '1', title: 'ゼルダの伝説 ティアーズ オブ ザ キングダム', categories: ['アクション', 'RPG'] },
    { id: '2', title: 'スプラトゥーン3', categories: ['シューティング'] },
    { id: '3', title: 'マリオカート8 デラックス', categories: ['スポーツ'] },
    { id: '4', title: 'ぷよぷよテトリス2', categories: ['パズル'] },
    { id: '5', title: 'ベヨネッタ3', categories: ['アクション'] },
    { id: '6', title: 'ポケットモンスター スカーレット', categories: ['RPG'] },
    { id: '7', title: 'スーパーマリオブラザーズ ワンダー', categories: ['アクション'] },
    { id: '8', title: 'ピクミン4', categories: ['アクション', 'パズル'] },
    { id: '9', title: 'ファイアーエムブレム エンゲージ', categories: ['RPG'] },
    { id: '10', title: 'カービィのグルメフェス', categories: ['アクション'] },
  ];

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Container maxW="90%" py={8}>
        <Stack direction="column" gap={8}>
          <Heading as="h1" fontSize={{ base: "3xl", md: "5xl" }} textAlign="center" color="white">
            GameReview Hub
          </Heading>
          
          <SearchWithResults games={dummyGames} />
        </Stack>
      </Container>
    </Box>
  );
};

export default HomePage;