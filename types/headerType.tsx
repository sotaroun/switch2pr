// export type HeaderProps = {
//   menus: {
//     menuLabel: string;
//     href?: string;
//     menuLinks?: { label: string; href: string }[];
//   }[];
// };

export type MenuLink = {
  href: string;
  label: string;
};

export type Menu = {
  menuLabel: string;
  href?: string;
  menuLinks?: MenuLink[];
};

export type HeaderProps = {
  menus: Menu[];
};
