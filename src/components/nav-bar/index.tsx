import { type ComponentProps, type FC } from "react";

import { getNavItems } from "@utils/site";

import NavBarPrv from "./nav-bar.client";


type INavBarProps = Omit<ComponentProps<typeof NavBarPrv>, 'navItems'>;

const NavBar: FC<INavBarProps> = props => {
  const navItems = getNavItems();

  return (
    <NavBarPrv {...props} navItems={navItems} />
  );
};


export default NavBar;
