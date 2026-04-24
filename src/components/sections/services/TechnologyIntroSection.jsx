"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { safeParse } from "@/utils/safeParse";
import he from "he";
import { Reveal } from "@/components/common/Reveal";
import { useReveal } from "@/hooks/useReveal";

// Lazy-load tech icons so each service page only fetches the one its URL matches.
// Previously all 20 icons (~3000 lines of SVG + Framer Motion animation code) were
// bundled into every service-page chunk even though only one ever renders.
const ICONS = {
  react: dynamic(() => import("@/components/icons/ReactJsIcon"), {
    ssr: false,
    loading: () => null,
  }),
  angular: dynamic(() => import("@/components/icons/AngularJsIcon"), {
    ssr: false,
    loading: () => null,
  }),
  bigcommerce: dynamic(() => import("@/components/icons/BigcommerceIcon"), {
    ssr: false,
    loading: () => null,
  }),
  next: dynamic(() => import("@/components/icons/NextJsIcon"), {
    ssr: false,
    loading: () => null,
  }),
  shopify: dynamic(() => import("@/components/icons/ShopifyIcon"), {
    ssr: false,
    loading: () => null,
  }),
  wordpress: dynamic(() => import("@/components/icons/WordPressIcon"), {
    ssr: false,
    loading: () => null,
  }),
  laravel: dynamic(() => import("@/components/icons/LaravelIcon"), {
    ssr: false,
    loading: () => null,
  }),
  node: dynamic(() => import("@/components/icons/NodeJsIcon"), {
    ssr: false,
    loading: () => null,
  }),
  php: dynamic(() => import("@/components/icons/PhpIcon"), { ssr: false, loading: () => null }),
  vue: dynamic(() => import("@/components/icons/VueJsIcon"), { ssr: false, loading: () => null }),
  gatsby: dynamic(() => import("@/components/icons/GatsbyJsIcon"), {
    ssr: false,
    loading: () => null,
  }),
  meteor: dynamic(() => import("@/components/icons/MeteorJsIcon"), {
    ssr: false,
    loading: () => null,
  }),
  craftcms: dynamic(() => import("@/components/icons/CraftCmsIcon"), {
    ssr: false,
    loading: () => null,
  }),
  squarespace: dynamic(() => import("@/components/icons/SquareSpaceIcon"), {
    ssr: false,
    loading: () => null,
  }),
  rootsio: dynamic(() => import("@/components/icons/RootsIoIcon"), {
    ssr: false,
    loading: () => null,
  }),
  strapi: dynamic(() => import("@/components/icons/StrapiIcon"), {
    ssr: false,
    loading: () => null,
  }),
  webflow: dynamic(() => import("@/components/icons/WebflowIcon"), {
    ssr: false,
    loading: () => null,
  }),
  builderio: dynamic(() => import("@/components/icons/BuilderIoIcon"), {
    ssr: false,
    loading: () => null,
  }),
  wix: dynamic(() => import("@/components/icons/WixIcon"), { ssr: false, loading: () => null }),
  tailwind: dynamic(() => import("@/components/icons/TailwindIcon"), {
    ssr: false,
    loading: () => null,
  }),
};

// Match the URL substring to the icon key. Order matters: more specific
// substrings (e.g. "wordpress-website-development-agency") must be checked
// before shorter ones (e.g. "wordpress" alone would otherwise match both).
function resolveIconKey(pathname) {
  if (!pathname) return null;
  if (pathname.includes("wordpress-development-roots-io-stack")) return "rootsio";
  if (pathname.includes("wordpress-website-development-agency")) return "wordpress";
  if (pathname.includes("bigcommerce")) return "bigcommerce";
  if (pathname.includes("angular")) return "angular";
  if (pathname.includes("react")) return "react";
  if (pathname.includes("next")) return "next";
  if (pathname.includes("shopify")) return "shopify";
  if (pathname.includes("laravel")) return "laravel";
  if (pathname.includes("node-js")) return "node";
  if (pathname.includes("php")) return "php";
  if (pathname.includes("vue")) return "vue";
  if (pathname.includes("gatsby")) return "gatsby";
  if (pathname.includes("meteor")) return "meteor";
  if (pathname.includes("craft-cms")) return "craftcms";
  if (pathname.includes("squarespace")) return "squarespace";
  if (pathname.includes("strapi")) return "strapi";
  if (pathname.includes("webflow")) return "webflow";
  if (pathname.includes("builder-io")) return "builderio";
  if (pathname.includes("wix")) return "wix";
  if (pathname.includes("tailwind")) return "tailwind";
  return null;
}

const TechnologyIntroSection = ({ data }) => {
  const pathname = usePathname() || "";
  const videoRef = useReveal({ threshold: 0.2 });

  if (data?.hide_section === "yes") return null;

  return (
    <section
      className={`common-content-wrapper relative overflow-hidden py-80 max-lg:py-40 ${data?.extra_class || ""}`}
      id={data?.extra_id || undefined}
    >
      <div className="container-fluid-lg">
        <div className="flex flex-wrap items-start justify-between gap-40 m-0 p-0 w-full">
          <div className="w-full lg:mb-60 max-lg:order-1">
            <Reveal className="title title-white max-w-780">
              <h2>{safeParse(data?.title || "")}</h2>
            </Reveal>
          </div>

          {(() => {
            const iconKey = resolveIconKey(pathname);
            const IconComponent = iconKey ? ICONS[iconKey] : null;
            if (!IconComponent) return null;
            return (
              <div className="w-full lg:w-5/12 max-lg:order-3">
                <IconComponent />
              </div>
            );
          })()}

          <div className={`w-full lg:w-6/12 max-lg:order-2`}>
            <Reveal delay={300} className="content mb-40">
              <div>{safeParse(data?.description || "")}</div>
            </Reveal>

            {data?.cta_button && data.cta_button.url && (
              <Reveal delay={400}>
                <Link
                  href={data.cta_button.url}
                  aria-label={data.cta_button.title}
                  className="btn"
                  target={data.cta_button.target || "_self"}
                >
                  <span className="btn-txt">
                    {he.decode(data.cta_button.title)}
                    <span
                      className="btn-txt-extra"
                      data-txt={he.decode(data.cta_button.title)}
                    ></span>
                  </span>
                </Link>
              </Reveal>
            )}
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center items-center overflow-hidden max-lg:mt-40 mt-60">
        <video
          ref={videoRef}
          muted
          loop
          autoPlay
          playsInline
          src="/videos/technologyvideo.mp4"
          className="media-scale-reveal object-cover pointer-events-none w-full h-full"
        />
      </div>
    </section>
  );
};

export default TechnologyIntroSection;
