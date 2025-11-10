import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Stack,
  Text, 
  Wrap, 
  WrapItem,
  Badge
} from "@chakra-ui/react";
import PlatformButton from "@/components/atoms/buttons/PlatformButton";
import { GamePlatform } from "@/types/game";

interface PlatformFilterProps {
  /** 利用可能なプラットフォーム一覧 */
  platforms: readonly GamePlatform[];
  /** 現在選択中のプラットフォーム */
  selectedPlatforms: GamePlatform[];
  /** プラットフォーム選択切り替え時のハンドラー */
  onPlatformToggle: (platform: GamePlatform) => void;
}

/**
 * プラットフォームフィルター機能を提供するMoleculeコンポーネント
 */
const PlatformFilter: React.FC<PlatformFilterProps> = ({
  platforms,
  selectedPlatforms,
  onPlatformToggle
}) => {
  const [animatingButtons, setAnimatingButtons] = useState<Set<GamePlatform>>(new Set());

  /**
   * プラットフォームボタンクリック時の処理
   */
  const handlePlatformClick = useCallback((platform: GamePlatform) => {
    // アニメーション開始
    setAnimatingButtons(prev => new Set([...prev, platform]));
    
    // 即座にフィルター実行
    onPlatformToggle(platform);
    
    // アニメーション終了
    setTimeout(() => {
      setAnimatingButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(platform);
        return newSet;
      });
    }, 300);
  }, [onPlatformToggle]);

  /**
   * キーボード操作（Enter/Space）の処理
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  }, []);

  return (
    <Box as="section" mb={8} aria-labelledby="platform-filter-title">
      {/* フィルター説明 */}
      <Stack direction="column" gap={6} textAlign="center" mb={6}>
        {/* 現在の選択表示 */}
        <Stack direction="column" gap={3}>
          <Text color="blue.400" fontWeight="medium" role="status" aria-live="polite">
            選択中: {selectedPlatforms.length}個のプラットフォーム
          </Text>
          {selectedPlatforms.length > 0 && (
            <Wrap justify="center" gap={2}>
              {selectedPlatforms.map((platform) => (
                <WrapItem key={platform}>
                  <Badge 
                    colorScheme="blue" 
                    variant="subtle" 
                    fontSize="xs"
                    px={2} 
                    py={1}
                  >
                    {platform}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>
          )}
        </Stack>
      </Stack>

      {/* プラットフォームボタン群 */}
      <Wrap 
        justify="center" 
        gap={3}
        role="group"
        aria-label="プラットフォーム選択ボタン"
      >
        {platforms.map((platform, index) => {
          const isSelected = selectedPlatforms.includes(platform);
          const isAnimating = animatingButtons.has(platform);
          
          return (
            <WrapItem key={platform}>
              <PlatformButton
                platform={platform}
                isSelected={isSelected}
                isAnimating={isAnimating}
                onClick={() => handlePlatformClick(platform)}
                onKeyDown={(e) => handleKeyDown(e, () => handlePlatformClick(platform))}
                animationDelay={`${index * 50}ms`}
              />
            </WrapItem>
          );
        })}
      </Wrap>
    </Box>
  );
};

export default PlatformFilter;
