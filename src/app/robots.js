export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_DOMAIN || "";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/wp-admin/", "/wp-login.php", "/wp-json/", "/?s=", "/search", "/*?*"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
