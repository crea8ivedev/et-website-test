import { normalizePathname } from "@/lib/schema/urls";

function findServicesMenu(headerMenu) {
  if (!Array.isArray(headerMenu)) return null;
  // Prefer explicit "Services" title, fall back to first item with submenu_item array
  const byTitle = headerMenu.find(
    (m) => typeof m?.menu_item?.title === "string" && m.menu_item.title.toLowerCase() === "services"
  );
  if (byTitle) return byTitle;
  return (
    headerMenu.find((m) => Array.isArray(m?.submenu_item) && m.submenu_item.length > 0) || null
  );
}

export function extractServicePages(themeOptions) {
  const headerMenu = themeOptions?.header_menu;
  const servicesMenu = findServicesMenu(headerMenu);
  const submenu = Array.isArray(servicesMenu?.submenu_item) ? servicesMenu.submenu_item : [];

  const map = new Map();
  for (const item of submenu) {
    const url = item?.menu_item?.url;
    const title = item?.menu_item?.title;
    if (typeof url !== "string" || !url) continue;
    const pathname = normalizePathname(url);
    if (pathname === "/" || pathname === "#") continue;
    map.set(pathname, typeof title === "string" ? title : "");
  }
  return map;
}
