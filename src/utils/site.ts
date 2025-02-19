import _allRoutes from "@/public/build/all-routes.json";


const allRoutes = _allRoutes as RouteNode;

export interface LinkItem {
  label: string;
  url: string;
}

export interface RouteNode {
  id: string;
  name: string;
  description: string;
  mtime: number;
  changeFreq: "daily" | "weekly" | "monthly";
  priority: number;
  children?: RouteNode[];
  level?: number;
  hidden?: boolean;
}

export const getTopPaths = (): LinkItem[] => {
  const list: LinkItem[] = [];

  if (allRoutes.id === '/') {
    list.push({
      label: "Home",
      url: "/",
    });

    if (allRoutes.children) {
      const children = allRoutes.children.slice();
      children.sort((a, b) => (b.level ?? 0) - (a.level ?? 0));
      for (const item of children) {
        if (!item.hidden) {
          list.push({
            label: item.name,
            url: item.id,
          });
        }
      }
    }
  }

  return list;
};
