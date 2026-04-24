import "../styles/globals.css";
import Providers from "@/components/providers/Providers";
import { DefaultDescription, DefaultTitle } from "@/constants";
import ConditionalHeader from "@/components/layout/ConditionalHeader";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import getThemeOptions from "@/services/site/getThemeOptions";
import localFont from "next/font/local";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import dynamic from "next/dynamic";

const LordiconPlayer = dynamic(() => import("@/components/layout/LordiconPlayer"), {
  ssr: false,
});

const dmSans = localFont({
  src: [
    { path: "../../public/assets/fonts/DMSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/assets/fonts/DMSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/assets/fonts/DMSans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/assets/fonts/DMSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-dm-sans",
  display: "swap",
  adjustFontFallback: "Arial",
});

const aeonik = localFont({
  src: [
    { path: "../../public/assets/fonts/Aeonik-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/assets/fonts/Aeonik-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/assets/fonts/Aeonik-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-aeonik",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_DOMAIN || "http://localhost:3000"),
  title: DefaultTitle,
  description: DefaultDescription,
};

export default async function RootLayout({ children }) {
  const themeOptions = await getThemeOptions();
  const {
    header_lets_talk,
    header_menu,
    menu_image,
    start_project,
    start_career,
    footer_text,
    address,
    address_link,
    contact_info,
    email,
    social_media_links,
    copyright_menu,
    site_name,
    google_review_images,
    google_review_link,
    clutch_review_images,
    clutch_review_link,
    footer_bottom_text,
    header_logo_image,
  } = themeOptions || {};

  // suppressHydrationWarning on <html>: browser extensions (dark-mode, translate, etc.)
  // modify the html element client-side causing a harmless mismatch we intentionally suppress.
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${aeonik.variable}`}>
      <head>
        {process.env.NEXT_PUBLIC_WORDPRESS_IMAGE_HOSTNAME && (
          <link
            rel="preconnect"
            href={`https://${process.env.NEXT_PUBLIC_WORDPRESS_IMAGE_HOSTNAME}`}
            crossOrigin="anonymous"
          />
        )}
        <link rel="preconnect" href="https://cdn.lordicon.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://www.gstatic.com" />
      </head>
      <body className="antialiased">
        <Providers>
          <ConditionalHeader
            headerData={{
              header_logo_image,
              header_lets_talk,
              header_menu,
              menu_image,
            }}
          />
          {children}
          <ConditionalFooter
            footerData={{
              start_project,
              start_career,
              footer_text,
              address,
              address_link,
              contact_info,
              email,
              social_media_links,
              copyright_menu,
              site_name,
              google_review_images,
              google_review_link,
              clutch_review_images,
              clutch_review_link,
              footer_bottom_text,
              header_menu,
            }}
          />
          <LordiconPlayer />
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
