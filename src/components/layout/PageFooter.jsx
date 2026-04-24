"use client";
import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isEmpty } from "@/utils/isEmpty";

const WP_HOST =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_WORDPRESS_IMAGE_HOSTNAME || "" : "";

const normalizeHref = (url) => {
  if (!url) return "#";
  try {
    const parsed = new URL(url);
    if (WP_HOST && parsed.hostname === WP_HOST) {
      return parsed.pathname.replace(/\/$/, "") || "/";
    }
  } catch {}
  return url;
};

const getPath = (url) => {
  if (!url) return "";
  try {
    return new URL(url, "http://localhost").pathname.replace(/\/$/, "").toLowerCase() || "/";
  } catch {
    return url.replace(/\/$/, "").toLowerCase() || "/";
  }
};

const PageFooter = ({ footerData }) => {
  const pathname = usePathname();
  const currentPath = pathname.toLowerCase();

  const projectIconRef = useRef(null);
  const servicesMenu = footerData?.header_menu?.find(
    (item) => item?.menu_item?.title?.toLowerCase() === "services"
  );
  const serviceLinks = (servicesMenu?.submenu_item || [])
    .filter((sub) => sub?.menu_item?.title && sub?.menu_item?.url)
    .map((sub) => ({ label: sub.menu_item.title, href: normalizeHref(sub.menu_item.url) }));
  return (
    <footer className="footer relative overflow-hidden">
      <div className="site-footer-inner bg-black-700 rounded-tl-10 rounded-tr-10 overflow-hidden max-md:mx-20 mx-40 mt-40">
        <div className="container-fluid border-0 border-b border-semigray-100/25">
          <div className="btn-custom flex flex-wrap justify-between w-full py-20">
            {footerData.start_project && (
              <Link
                href={footerData.start_project.url}
                aria-label={footerData.start_project.title}
                className="font-semibold uppercase flex items-center justify-center gap-10 w-auto max-w-max duration-300 ease-linear footer-main-link"
              >
                {footerData.start_project.title}
                <svg
                  className="size-[2.2vw] max-639:size-15"
                  width="42"
                  height="42"
                  viewBox="0 0 424 424"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M390.004 222.315V33.3333H201.021"
                    stroke="#eda800"
                    strokeWidth="66.6667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M33.3335 390.003L347.417 75.9208"
                    stroke="#eda800"
                    strokeWidth="66.6667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            )}
            {footerData.start_career && (
              <Link
                href={footerData.start_career.url}
                aria-label={footerData.start_career.title}
                className="font-semibold uppercase flex items-center justify-center gap-10 w-auto max-w-max duration-300 ease-linear footer-main-link"
              >
                {footerData.start_career.title}
                <svg
                  className="size-[2.2vw] max-639:size-15"
                  width="42"
                  height="42"
                  viewBox="0 0 424 424"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M390.004 222.315V33.3333H201.021"
                    stroke="#eda800"
                    strokeWidth="66.6667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M33.3335 390.003L347.417 75.9208"
                    stroke="#eda800"
                    strokeWidth="66.6667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
        <div className="container-fluid">
          <div className="w-full flex flex-wrap items-start justify-between gap-40 py-30 max-1199:flex-col">
            <div className="w-fit">
              <div className="sayhello flex-1">
                {footerData.footer_text && (
                  <div className="pre-heading">
                    <span>{footerData.footer_text}</span>
                  </div>
                )}
                <div className="flex flex-col gap-20 mt-25 max-639:mt-15">
                  {!isEmpty(footerData?.contact_info) ? (
                    <div className="contact-item">
                      <div className="flex flex-wrap gap-y-5 gap-15 flex-col">
                        {footerData.contact_info.map((item, index) => {
                          const phone = item?.phone_number;
                          if (!phone) return null;

                          if (typeof phone === "object") {
                            const href = typeof phone.url === "string" ? phone.url : "";
                            const text = typeof phone.title === "string" ? phone.title : "";
                            const target =
                              typeof phone.target === "string" ? phone.target : "_blank";

                            if (!text) return null;

                            return href ? (
                              <a
                                key={index}
                                href={href}
                                aria-label={text}
                                target={target}
                                rel="noreferrer"
                                className="link"
                              >
                                {text}
                              </a>
                            ) : (
                              <span key={index} className="link">
                                {text}
                              </span>
                            );
                          }

                          if (typeof phone === "string") {
                            const cleanNumber = phone
                              .replace(/^https?:\/\/wa\.me\//i, "")
                              .replace(/\//g, "");

                            const displayPhoneNumber =
                              cleanNumber?.startsWith("+91") && cleanNumber?.length === 13
                                ? `${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3, 7)} ${cleanNumber.slice(7, 9)} ${cleanNumber.slice(9, 11)} ${cleanNumber.slice(11)}`
                                : cleanNumber;

                            if (!cleanNumber) return null;

                            return (
                              <a
                                key={index}
                                href={phone}
                                aria-label={`contact number ${displayPhoneNumber}`}
                                target="_blank"
                                rel="noreferrer"
                                className="link"
                              >
                                {displayPhoneNumber}
                              </a>
                            );
                          }

                          return null;
                        })}
                      </div>
                    </div>
                  ) : null}
                  {footerData.email && (
                    <div className="contact-item">
                      <Link
                        href={`mailto:${footerData.email}`}
                        aria-label="Mail address"
                        target="_blank"
                        className="link"
                      >
                        {footerData.email}
                      </Link>
                    </div>
                  )}
                  {footerData.address && footerData.address_link && (
                    <div className="contact-item lg:max-w-310 max-w-276">
                      <Link
                        href={footerData.address_link}
                        aria-label="Company address"
                        target="_blank"
                        className="link"
                      >
                        {footerData.address}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="w-fit">
              <div className="sayhello flex-1">
                <div className="pre-heading">
                  <span>Services</span>
                </div>
                <ul className="grid grid-cols-2 gap-y-12 gap-x-22 mt-25 max-639:grid-cols-1 max-639:mt-15">
                  {serviceLinks.map((service, idx) => {
                    const linkPath = getPath(service.href);
                    const isActive =
                      currentPath === linkPath || currentPath.startsWith(linkPath + "/");
                    return (
                      <li key={idx}>
                        <Link
                          href={service.href}
                          className={`text-base transition-colors duration-200 hover:text-[var(--color-gold)] ${isActive ? "text-[var(--color-gold)]" : "text-white"}`}
                        >
                          {service.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div className="w-full max-lg:flex-none lg:w-200">
              {!isEmpty(footerData?.social_media_links) ? (
                <ul className="flex flex-wrap items-center max-sm:gap-10 gap-20 mt-6 max-1199:mt-0">
                  {footerData.social_media_links.map((item, index) => {
                    if (!item.social_media_url) return null;
                    if (index === 0) {
                      return (
                        <li key={index}>
                          <Link
                            href={item.social_media_url}
                            target="_blank"
                            aria-label="linkedin"
                            className="flex flex-col items-center justify-center size-32 rounded-full border border-solid border-white/40 hover:bg-white/10"
                          >
                            <lord-icon
                              src="https://cdn.lordicon.com/qgebwute.json"
                              trigger="hover"
                              colors="primary:#ffffff,secondary:#ffffff"
                              className="size-18"
                            ></lord-icon>
                          </Link>
                        </li>
                      );
                    }
                    if (index === 1) {
                      return (
                        <li key={index}>
                          <Link
                            href={item.social_media_url}
                            target="_blank"
                            aria-label="instagram"
                            className="flex flex-col items-center justify-center size-32 rounded-full border border-solid border-white/40 hover:bg-white/10"
                          >
                            <lord-icon
                              src="https://cdn.lordicon.com/tgyvxauj.json"
                              trigger="hover"
                              state="hover-rotate"
                              colors="primary:#ffffff,secondary:#ffffff"
                              className="size-18"
                            ></lord-icon>
                          </Link>
                        </li>
                      );
                    }
                    if (index === 2) {
                      return (
                        <li key={index}>
                          <Link
                            href={item.social_media_url}
                            target="_blank"
                            aria-label="facebook"
                            className="flex flex-col items-center justify-center size-32 rounded-full border border-solid border-white/40 hover:bg-white/10"
                          >
                            <lord-icon
                              src="https://cdn.lordicon.com/bfoumeno.json"
                              trigger="hover"
                              state="hover-roll"
                              colors="primary:#ffffff,secondary:#ffffff"
                              className="size-18"
                            ></lord-icon>
                          </Link>
                        </li>
                      );
                    }
                    if (index === 3) {
                      return (
                        <li key={index}>
                          <Link
                            href={item.social_media_url}
                            target="_blank"
                            aria-label="youtube"
                            className="flex flex-col items-center justify-center size-32 rounded-full border border-solid border-white/40 hover:bg-white/10"
                          >
                            <lord-icon
                              src="https://cdn.lordicon.com/lyjuidpq.json"
                              trigger="hover"
                              colors="primary:#ffffff,secondary:#ffffff"
                              className="size-18"
                            ></lord-icon>
                          </Link>
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>
              ) : null}
              <div className="google-cluth-review mt-32 max-1199:mt-30">
                <div className="flex flex-wrap xl:flex-col gap-32 max-1199:gap-30 items-start max-lg:justify-between justify-end">
                  {(typeof footerData.google_review_images === "string"
                    ? footerData.google_review_images
                    : footerData.google_review_images?.url) &&
                    (footerData.google_review_link ? (
                      <Link
                        href={footerData.google_review_link}
                        target="_blank"
                        aria-label="google review"
                        className="lg:w-full"
                      >
                        <Image
                          src={
                            typeof footerData.google_review_images === "string"
                              ? footerData.google_review_images
                              : footerData.google_review_images.url
                          }
                          width={200}
                          height={60}
                          alt={
                            footerData.google_review_images?.alt ||
                            "Google Reviews - Encircle Technologies"
                          }
                          className="max-sm:max-w-[32vw] w-200 lg:w-full aspect-[200/60] h-auto"
                        />
                      </Link>
                    ) : (
                      <Image
                        src={
                          typeof footerData.google_review_images === "string"
                            ? footerData.google_review_images
                            : footerData.google_review_images.url
                        }
                        width={200}
                        height={60}
                        alt={
                          footerData.google_review_images?.alt ||
                          "Google Reviews - Encircle Technologies"
                        }
                        className="max-sm:max-w-[32vw] w-200 lg:w-full h-auto"
                        unoptimized
                      />
                    ))}
                  {(typeof footerData.clutch_review_images === "string"
                    ? footerData.clutch_review_images
                    : footerData.clutch_review_images?.url) &&
                    (footerData.clutch_review_link ? (
                      <Link
                        href={footerData.clutch_review_link}
                        target="_blank"
                        aria-label="clutch review"
                        className="lg:w-full"
                      >
                        <Image
                          src={
                            typeof footerData.clutch_review_images === "string"
                              ? footerData.clutch_review_images
                              : footerData.clutch_review_images.url
                          }
                          width={200}
                          height={60}
                          alt={
                            footerData.clutch_review_images?.alt ||
                            "Clutch Reviews - Encircle Technologies"
                          }
                          className="max-sm:max-w-[32vw] w-200 lg:w-full aspect-[200/60] h-auto"
                        />
                      </Link>
                    ) : (
                      <Image
                        src={
                          typeof footerData.clutch_review_images === "string"
                            ? footerData.clutch_review_images
                            : footerData.clutch_review_images.url
                        }
                        width={200}
                        height={60}
                        alt={
                          footerData.clutch_review_images?.alt ||
                          "Clutch Reviews - Encircle Technologies"
                        }
                        className="max-sm:max-w-[32vw] w-200 lg:w-full h-auto"
                        unoptimized
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {footerData.footer_bottom_text && (
        <div className="bottom-links-wrapper overflow-hidden">
          <div className="footer-marquee flex w-max gap-[3vw] marquee-row my-30">
            {[0, 1].map((groupIdx) => (
              <div
                key={groupIdx}
                className="flex gap-[3vw]"
                aria-hidden={groupIdx === 1 ? "true" : undefined}
              >
                {[...Array(8)].map((_, i) => (
                  <div key={`${groupIdx}-${i}`}>
                    <span className="max-sm:text-[5vw] text-[3vw] font-bold uppercase whitespace-nowrap opacity-60">
                      {footerData.footer_bottom_text}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-black-700 rounded-bl-10 rounded-br-10 overflow-hidden max-sm:mx-20 mx-40 max-sm:mb-20 mb-40">
        <div className="container-fluid">
          <div className="w-full flex flex-wrap items-center justify-between max-lg:gap-20 py-20 max-639:flex-col">
            <div className="content sm">
              {footerData.site_name && (
                <p>
                  ©{" "}
                  {new Intl.DateTimeFormat("en-IN", {
                    year: "numeric",
                    timeZone: "Asia/Kolkata",
                  }).format(new Date())}{" "}
                  <Link
                    href="/"
                    aria-label={footerData.site_name}
                    title={footerData.site_name}
                    className="hover:text-gold"
                  >
                    {footerData.site_name}
                  </Link>
                </p>
              )}
            </div>
            <div className="secondary-link-wrapper">
              {!isEmpty(footerData?.copyright_menu) ? (
                <div className="links flex items-start gap-10 max-639:flex-col max-639:items-center">
                  {footerData.copyright_menu.map(
                    (item, index) =>
                      item.menu_item && (
                        <Link
                          key={index}
                          href={item.menu_item.url}
                          aria-label={item.menu_item.title}
                          className={`duration-300 ease-linear hover:text-gold ${pathname === item.menu_item.url.replace(/\/$/, "") ? "text-gold" : ""}`}
                        >
                          {item.menu_item.title}
                        </Link>
                      )
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
