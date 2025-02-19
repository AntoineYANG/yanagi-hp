import { type ComponentProps, type FC } from "react";

import { getTopPaths } from "@utils/site";

import NavBarPrv from "./nav-bar.client";


type INavBarProps = Omit<ComponentProps<typeof NavBarPrv>, 'navItems'>;

const NavBar: FC<INavBarProps> = props => {
  const navItems = getTopPaths();

  return (
    <NavBarPrv {...props} navItems={navItems} />
  );
};


export default NavBar;
