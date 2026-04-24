export function getMediaUrl(path) {
  if (!path) return "";
  const baseUrl = (process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "").replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
