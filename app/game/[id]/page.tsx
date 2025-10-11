"use client"
import React, { useCallback } from 'react';
import { Box, Container, Stack, Heading } from "@chakra-ui/react";
import InfiniteCommentList from '../../../components/organisms/CommentSection/InfiniteCommentList';
import { fetchCommentsAPI } from '../../../lib/comments';

interface GameDetailPageProps {
  params: { id: string };
}

const GameDetailPage: React.FC<GameDetailPageProps> = ({ params }) => {
  const gameId = params.id;

  // コメント取得関数をラップ
  const handleFetchComments = useCallback(
    (gId: string, cursor: string | null) => fetchCommentsAPI(gId, cursor, 50),
    []
  );

  // コメントクリック時の処理
  const handleCommentClick = useCallback((commentId: string) => {
    console.log('Comment clicked:', commentId);
    // 必要に応じて詳細表示などの処理
  }, []);

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Container maxW="90%" py={8}>
        <Stack direction="column" gap={8}>
          {/* ゲームヘッダー */}
          <Box>
            <Heading as="h1" fontSize={{ base: "2xl", md: "4xl" }} color="white" mb={4}>
              ゲーム詳細ページ
            </Heading>
            <Heading as="h2" fontSize="xl" color="gray.400" mb={6}>
              ゲームID: {gameId}
            </Heading>
          </Box>

          {/* コメント一覧（無限スクロール） */}
          <Box>
            <Heading as="h3" fontSize="2xl" color="white" mb={6}>
              コメント
            </Heading>
            <InfiniteCommentList
              gameId={gameId}
              fetchComments={handleFetchComments}
              onCommentClick={handleCommentClick}
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default GameDetailPage;