import _allRoutes from "@/public/build/all-routes.json";


const allRoutes = _allRoutes as RouteNode;

export interface LinkItem {
  label: string;
  url: string;
}

export interface INavItemList {
  common: LinkItem[];
  blogs: LinkItem[];
}

export interface RouteNode {
  valid: boolean;
  mode: "common" | "blogs";
  id: string;
  name: string;
  description: string;
  mtime: number;
  changeFreq: "daily" | "weekly" | "monthly";
  priority: number;
  container: string;
  children?: RouteNode[];
  level?: number;
  hidden?: boolean;
}

export const getNavItems = (): INavItemList => {
  const common: LinkItem[] = [];
  const blogs: LinkItem[] = [];

  if (allRoutes.id === '/') {
    common.push({
      label: "Home",
      url: "/",
    });

    if (allRoutes.children) {
      const links = allRoutes.children.filter(e => e.mode === "common");
      links.sort((a, b) => (b.level ?? 0) - (a.level ?? 0));
      for (const item of links) {
        if (!item.hidden) {
          common.push({
            label: item.name,
            url: item.id,
          });
        }
      }
    }
  }

  const b = allRoutes.children?.filter(e => e.mode === "blogs") ?? [];
  b.sort((a, b) => (b.level ?? 0) - (a.level ?? 0));
  for (const item of b) {
    blogs.push({
      label: item.name,
      url: item.id,
    });
  }

  return {
    common,
    blogs,
  };
};
