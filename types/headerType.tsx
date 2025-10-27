export type HeaderProps = {
  menus: {
    menuLabel: string; // PopoverTrigger のラベル（例: Categories, Services, Contact）
    menuLinks: { label: string; href: string }[]; // ドロップダウンの中身
  }[];
};
