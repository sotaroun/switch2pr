// components/organisms/search/PlatformFilter.tsx
import React, { memo } from 'react';
import PlatformFilter from "@/components/molecules/Navigation/PlatformFilter";
import { GamePlatform } from "@/types/game";

interface PlatformFilterOrgProps {
  /** 利用可能なプラットフォーム一覧 */
  platforms: readonly GamePlatform[];
  /** 現在選択中のプラットフォーム */
  selectedPlatforms: GamePlatform[];
  /** プラットフォーム選択切り替え時のハンドラー */
  onPlatformToggle: (platform: GamePlatform) => void;
}

/**
 * プラットフォームフィルターのOrganismラッパーコンポーネント
 */
const PlatformFilterOrg: React.FC<PlatformFilterOrgProps> = memo((props) => {
  return <PlatformFilter {...props} />;
});

PlatformFilterOrg.displayName = 'PlatformFilterOrg';

export default PlatformFilterOrg;