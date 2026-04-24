"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { isEmpty } from "@/utils/isEmpty";

const PageHeader = ({ headerData }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolledFar, setIsScrolledFar] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const pathname = usePathname();

  const leaveTimer = useRef(null);
  const lastSubmenuIndex = useRef(null);

  const normalizeHref = (url) => {
    if (!url) return "#";
    try {
      const parsed = new URL(url);
      const wpHost = process.env.NEXT_PUBLIC_WORDPRESS_IMAGE_HOSTNAME || "";
      if (wpHost && parsed.hostname === wpHost) {
        return parsed.pathname.replace(/\/$/, "") || "/";
      }
    } catch {}
    return url;
  };

  const getCleanPath = (url) => {
    if (!url) return "";
    try {
      const normalized = url.startsWith("http") ? url : url.startsWith("/") ? url : `/${url}`;
      const pathname = new URL(normalized, "http://localhost").pathname;
      const clean = pathname === "" ? "/" : pathname.replace(/\/+$/, "") || "/";
      return clean.toLowerCase();
    } catch {
      const cleaned = url.replace(/\\/g, "/");
      const pathname = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
      return (pathname.replace(/\/+$/, "") || "/").toLowerCase();
    }
  };

  const isHomeHashLink = (url) =>
    typeof url === "string" && url.includes("#") && getCleanPath(url) === "/";

  const isNestedRoute = (parentPath, childPath) => {
    if (!parentPath || parentPath === "/" || isHomeHashLink(parentPath)) return false;
    return childPath.startsWith(`${parentPath}/`);
  };

  const currentPath = getCleanPath(pathname);

  const isActiveSubMenuItem = (subItem) => {
    if (isHomeHashLink(subItem?.menu_item?.url)) return false;
    const subPath = getCleanPath(subItem?.menu_item?.url);
    return subPath === currentPath || isNestedRoute(subPath, currentPath);
  };

  const isActiveMenuItem = (item) => {
    const itemPath = getCleanPath(item?.menu_item?.url);
    const isHashOnly = isHomeHashLink(item?.menu_item?.url) || item?.menu_item?.url === "#";

    if (!isHashOnly) {
      if (itemPath === currentPath) return true;
      if (isNestedRoute(itemPath, currentPath)) return true;
    }

    if (
      item.enable_submenu &&
      Array.isArray(item.submenu_item) &&
      item.submenu_item.some((sub) => isActiveSubMenuItem(sub))
    ) {
      return true;
    }

    return false;
  };

  const routeActiveIndex = headerData?.header_menu?.length
    ? (() => {
        const index = headerData.header_menu.findIndex((item) => isActiveMenuItem(item));
        return index >= 0 ? index : null;
      })()
    : null;

  const activeIndex = hoveredIndex !== null ? hoveredIndex : routeActiveIndex;
  const isTechnologiesMenuItem = (item, index) => {
    const title = String(item?.menu_item?.title || "");
    return index === 1 || /technolog/i.test(title);
  };
  const isActiveTechnologiesMenu =
    activeIndex !== null &&
    Array.isArray(headerData?.header_menu) &&
    isTechnologiesMenuItem(headerData.header_menu[activeIndex], activeIndex);
  const isHeaderGlassActive =
    hoveredIndex !== null || (!isSticky && isScrolled) || isSticky || isMenuOpen;

  const menuMedia = useMemo(() => {
    const isValidImageSrc = (src) => {
      if (typeof src !== "string") return false;
      const s = src.trim();
      if (!s) return false;
      return s.startsWith("/") || /^https?:\/\//i.test(s);
    };

    const activeItem =
      activeIndex != null && Array.isArray(headerData?.header_menu)
        ? headerData.header_menu[activeIndex]
        : null;

    const raw =
      activeItem?.menu_image ??
      activeItem?.menu_images ??
      headerData?.menu_image ??
      headerData?.menu_images ??
      null;

    const items = Array.isArray(raw) ? raw : raw ? [raw] : [];

    return items
      .map((item) => {
        if (!item) return null;

        if (typeof item === "string") {
          const url = item.trim();
          if (!isValidImageSrc(url)) return null;
          return {
            url,
            alt: activeItem?.menu_item?.title || "Encircle Technologies",
          };
        }

        const normalized = item?.url ? item : item?.image?.url ? item.image : null;
        if (!normalized?.url) return null;

        const url = String(normalized.url || "").trim();
        if (!isValidImageSrc(url)) return null;

        return {
          url,
          alt:
            normalized.alt || item?.alt || activeItem?.menu_item?.title || "Encircle Technologies",
        };
      })
      .filter(Boolean);
  }, [activeIndex, headerData]);

  const closeMenu = useCallback(() => {
    clearTimeout(leaveTimer.current);
    lastSubmenuIndex.current = null;
    setIsMenuOpen(false);
    setOpenSubmenu(null);
    setHoveredIndex(null);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      const nextOpen = !prev;
      if (nextOpen) {
        const activeRouteItem =
          routeActiveIndex !== null && Array.isArray(headerData?.header_menu)
            ? headerData.header_menu[routeActiveIndex]
            : null;
        const defaultOpenSubmenuIndex =
          activeRouteItem?.enable_submenu &&
          Array.isArray(activeRouteItem?.submenu_item) &&
          activeRouteItem.submenu_item.length > 0
            ? routeActiveIndex
            : null;
        setOpenSubmenu(defaultOpenSubmenuIndex);
      }
      return nextOpen;
    });
  }, [headerData, routeActiveIndex]);

  const stickyRef = useRef(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;

      // Only update boolean states when crossing thresholds — avoids re-render on every pixel
      const nextScrolled = currentScrollY > 20;
      const nextScrolledFar = currentScrollY > 300;
      setIsScrolled((prev) => (prev !== nextScrolled ? nextScrolled : prev));
      setIsScrolledFar((prev) => (prev !== nextScrolledFar ? nextScrolledFar : prev));

      if (currentScrollY < lastScrollY && currentScrollY > 300) {
        if (!stickyRef.current) {
          stickyRef.current = true;
          setIsSticky(true);
          closeMenu();
        }
      } else if (currentScrollY > lastScrollY || currentScrollY <= 300) {
        if (stickyRef.current) {
          stickyRef.current = false;
          setIsSticky(false);
        }
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [closeMenu]);

  useEffect(() => {
    const handler = (e) => setIsApplyModalOpen(e.detail.open);
    window.addEventListener("applyModalChange", handler);
    return () => window.removeEventListener("applyModalChange", handler);
  }, []);
  return (
    <>
      <header
        className={`header fixed w-full top-0 z-99999
          ${isSticky ? "pt-20 duration-300 delay-150 ease-linear" : "max-lg:pt-20 pt-30"}
          ${!isSticky && isScrolled ? "is-scrolling" : ""}
          ${!isSticky && isScrolledFar ? "is-hidden" : ""}
          ${isApplyModalOpen ? "header-hidden" : ""}
        `}
      >
        <div className="container-fluid">
          <div
            className={`
              ${isSticky ? "max-w-[58em] duration-300 delay-150 ease-linear shadow-xl" : "max-w-full duration-300 delay-150 ease-linear"} 
              ${!isSticky && isScrolled ? "max-w-[58em]!" : ""}
              mx-auto rounded-10 relative overflow-hidden`}
          >
            <div className="absolute inset-0 duration-300 delay-150 ease-linear">
              <div
                className={`rounded-10 size-full duration-300 delay-150 ease-linear
                ${
                  isHeaderGlassActive
                    ? `bg-linear-175 from-black-500/40 100% via-black-500/20 80% to-black-500/40 0% backdrop-blur-sm ${isMenuOpen ? "max-lg:backdrop-blur-xl" : ""}`
                    : "bg-black-600/0"
                }`}
              >
                {isHeaderGlassActive ? (
                  <div className="absolute inset-0 rounded-10 duration-300 delay-150 ease-linear">
                    <div
                      className="mix-blend-difference blur-sm"
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "10px",
                        background:
                          "linear-gradient(175deg, rgba(102,102,102,1) 0%, rgba(74,74,74,0) 25%, rgba(74,74,74,0) 60%, rgba(102,102,102,1) 100%)",
                        padding: "2px",
                        WebkitMask:
                          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        pointerEvents: "none",
                        zIndex: 3,
                      }}
                    ></div>
                  </div>
                ) : null}
              </div>
            </div>

            <div
              className={`flex max-lg:flex-wrap flex-row items-center justify-between relative w-full py-0 px-20 ${(!isSticky && isScrolled) || isSticky || isMenuOpen ? "max-lg:py-5 max-lg:px-10" : "max-lg:p-0"} duration-300 ease-linear`}
            >
              <div className="logo relative duration-300 delay-150 ease-linear">
                <Link href="/" onClick={closeMenu}>
                  <Image
                    src={
                      typeof headerData?.header_logo_image === "string"
                        ? headerData.header_logo_image
                        : headerData?.header_logo_image?.url ||
                          headerData?.header_logo?.url ||
                          headerData?.header_logo ||
                          "/images/brand/ET-logo.svg"
                    }
                    className="block relative inset-0 h-68 duration-300 delay-150 ease-linear"
                    alt="Logo"
                    aria-label="Encircle Technologies"
                    width={120}
                    height={60}
                    priority
                    fetchPriority="high"
                    unoptimized
                  />
                </Link>
              </div>

              {!isEmpty(headerData?.header_menu) && (
                <nav className="header-nav max-lg:hidden">
                  <ul className="flex max-lg:flex-col items-center gap-0">
                    {headerData.header_menu.map(
                      (item, index) =>
                        item.menu_item && (
                          <li
                            key={index}
                            className={`static group ${isActiveMenuItem(item) ? "active" : ""}`}
                            onMouseEnter={() => {
                              clearTimeout(leaveTimer.current);
                              if (item.enable_submenu) {
                                lastSubmenuIndex.current = index;
                                setHoveredIndex(index);
                              } else {
                                lastSubmenuIndex.current = null;
                                setHoveredIndex(null);
                              }
                            }}
                            onMouseLeave={() => {
                              leaveTimer.current = setTimeout(() => setHoveredIndex(null), 100);
                            }}
                          >
                            {item.menu_item.url === "#" ? (
                              <button
                                type="button"
                                className={`py-30 px-15 block font-heading text-body-3 leading-20 capitalize group-hover:text-gold duration-300 ease-linear ${isActiveMenuItem(item) ? "text-gold" : ""}`}
                                aria-label={item.menu_item.title}
                              >
                                {item.menu_item.title}
                              </button>
                            ) : (
                              <Link
                                href={normalizeHref(item.menu_item.url)}
                                className={`py-30 px-15 block font-heading text-body-3 leading-20 capitalize group-hover:text-gold duration-300 ease-linear ${isActiveMenuItem(item) ? "text-gold" : ""}`}
                                aria-label={item.menu_item.title}
                                onClick={closeMenu}
                                target={item.menu_item.target || "_self"}
                                rel={
                                  item.menu_item.target === "_blank"
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                              >
                                {item.menu_item.title}
                              </Link>
                            )}
                          </li>
                        )
                    )}
                  </ul>
                </nav>
              )}

              <div className="header-right flex items-center gap-20">
                {headerData.header_lets_talk && (
                  <Link
                    href={headerData.header_lets_talk.url}
                    aria-label={headerData.header_lets_talk.title}
                    className="max-lg:hidden cursor-pointer"
                    onClick={closeMenu}
                  >
                    <div className="book-call-btn ring-shake-parent group capitalize font-heading hover:text-gold max-sm:text-body-6 text-body-3 flex items-center gap-10 relative duration-300 ease-linear">
                      <span className="ring-shake">
                        <svg
                          className="max-sm:size-18 block"
                          width="22"
                          height="22"
                          viewBox="0 0 800 800"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            className="group-hover:stroke-gold duration-300 ease-linear"
                            d="M732.333 611C732.333 623 729.667 635.333 724 647.333C718.333 659.333 711 670.667 701.333 681.333C685 699.333 667 712.333 646.667 720.667C626.667 729 605 733.333 581.667 733.333C547.667 733.333 511.333 725.333 473 709C434.667 692.667 396.333 670.667 358.333 643C320 615 283.667 584 249 549.667C214.667 515 183.667 478.667 156 440.667C128.667 402.667 106.667 364.667 90.6667 327C74.6667 289 66.6667 252.667 66.6667 218C66.6667 195.333 70.6667 173.667 78.6667 153.667C86.6667 133.333 99.3334 114.667 117 98C138.333 77 161.667 66.6667 186.333 66.6667C195.667 66.6667 205 68.6667 213.333 72.6667C222 76.6667 229.667 82.6667 235.667 91.3334L313 200.333C319 208.667 323.333 216.333 326.333 223.667C329.333 230.667 331 237.667 331 244C331 252 328.667 260 324 267.667C319.667 275.333 313.333 283.333 305.333 291.333L280 317.667C276.333 321.333 274.667 325.667 274.667 331C274.667 333.667 275 336 275.667 338.667C276.667 341.333 277.667 343.333 278.333 345.333C284.333 356.333 294.667 370.667 309.333 388C324.333 405.333 340.333 423 357.667 440.667C375.667 458.333 393 474.667 410.667 489.667C428 504.333 442.333 514.333 453.667 520.333C455.333 521 457.333 522 459.667 523C462.333 524 465 524.333 468 524.333C473.667 524.333 478 522.333 481.667 518.667L507 493.667C515.333 485.333 523.333 479 531 475C538.667 470.333 546.333 468 554.667 468C561 468 567.667 469.333 575 472.333C582.333 475.333 590 479.667 598.333 485.333L708.667 563.667C717.333 569.667 723.333 576.667 727 585C730.333 593.333 732.333 601.667 732.333 611Z"
                            stroke="currentColor"
                            strokeWidth="50"
                            strokeMiterlimit="10"
                          />
                          <path
                            className="group-hover:stroke-gold duration-300 ease-linear"
                            d="M616.667 300C616.667 280 601 249.333 577.667 224.333C556.333 201.333 528 183.333 500 183.333"
                            stroke="currentColor"
                            strokeWidth="50"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            className="group-hover:stroke-gold duration-300 ease-linear"
                            d="M733.333 300C733.333 171 629 66.6667 500 66.6667"
                            stroke="currentColor"
                            strokeWidth="50"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span className="leading-none">{headerData.header_lets_talk.title}</span>
                    </div>
                  </Link>
                )}

                <button
                  className={`hamburger lg:hidden flex flex-col justify-center items-center gap-4 w-32 h-32 cursor-pointer ${isMenuOpen ? "is-open" : ""}`}
                  onClick={toggleMenu}
                  aria-label="Toggle Menu"
                >
                  <span className="hamburger-bar hamburger-bar--1 block w-32 h-1 bg-current" />
                  <span className="hamburger-bar hamburger-bar--2 block w-32 h-1 bg-current" />
                  <span className="hamburger-bar hamburger-bar--3 block w-32 h-1 bg-current" />
                </button>
              </div>

              <div className="lg:hidden relative w-full z-50 cursor-auto">
                {isMenuOpen && (
                  <ul
                    key="mobile-menu"
                    className={`mobile-menu-panel ${isMenuOpen ? "is-open" : ""} flex flex-col items-start px-10 pb-20 mt-20 gap-10 overflow-y-auto h-[calc(100vh-180px)] cursor-auto`}
                  >
                    {headerData?.header_menu?.map((item, index) => {
                      const isTechSubmenu = isTechnologiesMenuItem(item, index);

                      return (
                        <li
                          key={index}
                          className={`w-full cursor-auto ${isActiveMenuItem(item) ? "active" : ""}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            {item.menu_item.url === "#" ? (
                              <span
                                className={`block font-heading text-body-3 leading-20 capitalize hover:text-gold duration-300 ease-linear ${isActiveMenuItem(item) ? "text-gold" : ""}`}
                                aria-label={item.menu_item.title}
                              >
                                {item.menu_item.title}
                              </span>
                            ) : (
                              <Link
                                href={normalizeHref(item.menu_item.url)}
                                onClick={closeMenu}
                                className={`block font-heading text-body-3 leading-20 capitalize hover:text-gold duration-300 ease-linear ${isActiveMenuItem(item) ? "text-gold" : ""}`}
                                aria-label={item.menu_item.title}
                                target={item.menu_item.target || "_self"}
                                rel={
                                  item.menu_item.target === "_blank"
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                              >
                                {item.menu_item.title}
                              </Link>
                            )}
                            {item.enable_submenu &&
                              Array.isArray(item.submenu_item) &&
                              item.submenu_item.length > 0 && (
                                <button
                                  onClick={() =>
                                    setOpenSubmenu(openSubmenu === index ? null : index)
                                  }
                                  className="p-1"
                                >
                                  <span
                                    className={`submenu-arrow ${openSubmenu === index ? "is-open" : ""} block cursor-pointer`}
                                  >
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M6 9l6 6 6-6" />
                                    </svg>
                                  </span>
                                </button>
                              )}
                          </div>
                          {item.enable_submenu &&
                            Array.isArray(item.submenu_item) &&
                            item.submenu_item.length > 0 && (
                              <ul
                                className={`mobile-submenu ${openSubmenu === index ? "is-open" : ""} my-10 px-10 ${isTechSubmenu ? "grid grid-cols-2 gap-x-12 gap-y-4" : "flex flex-col gap-4"}`}
                              >
                                {item.submenu_item.map((subItem, sIdx) => (
                                  <li
                                    key={sIdx}
                                    className={isActiveSubMenuItem(subItem) ? "active" : ""}
                                  >
                                    <Link
                                      href={normalizeHref(subItem.menu_item.url)}
                                      onClick={closeMenu}
                                      className={`block font-heading text-body-4 capitalize hover:text-gold duration-300 ease-linear ${isActiveSubMenuItem(subItem) ? "text-gold font-semibold" : ""}`}
                                      aria-label={subItem.menu_item.title}
                                      target={subItem.menu_item.target || "_self"}
                                      rel={
                                        subItem.menu_item.target === "_blank"
                                          ? "noopener noreferrer"
                                          : undefined
                                      }
                                    >
                                      {subItem.menu_item.title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {!isEmpty(headerData?.header_menu) && (
              <div
                className={`${hoveredIndex !== null ? "grid-rows-[1fr] duration-300" : "grid-rows-[0fr] duration-300 delay-100"} ease-linear relative overflow-hidden grid w-full mega-menu cursor-auto`}
                onMouseEnter={() => {
                  clearTimeout(leaveTimer.current);
                  if (lastSubmenuIndex.current !== null) {
                    setHoveredIndex(lastSubmenuIndex.current);
                  }
                }}
                onMouseLeave={() => {
                  lastSubmenuIndex.current = null;
                  setHoveredIndex(null);
                }}
              >
                <div className="flex flex-col items-center relative overflow-hidden h-[10000%]">
                  <div className="flex flex-col items-center relative mt-20 w-full border-0 border-t border-white/5">
                    <div className="flex w-full gap-20 p-[2.5vw]">
                      <div className="flex flex-1 gap-20 ease-linear">
                        <div className="main-sub-menu max-md:hidden flex w-full flex-col gap-[1.375vw] rounded-10">
                          {activeIndex !== null &&
                            Array.isArray(headerData?.header_menu?.[activeIndex]?.submenu_item) &&
                            headerData.header_menu[activeIndex].submenu_item.length > 0 && (
                              <ul
                                key={headerData.header_menu[activeIndex].menu_item.title}
                                className={`mega-submenu-panel gap-10 ${isActiveTechnologiesMenu ? "grid grid-cols-2" : "flex flex-col"}`}
                              >
                                <li className={`${isActiveTechnologiesMenu ? "col-span-2" : ""}`}>
                                  <span className="text-body-6 text-white/60 uppercase">
                                    {headerData.header_menu[activeIndex].menu_item.title}
                                  </span>
                                </li>
                                {headerData.header_menu[activeIndex].submenu_item.map(
                                  (subItem, idx) => (
                                    <li
                                      key={subItem.menu_item.title + idx}
                                      className={`flex items-center justify-between w-full ${isActiveSubMenuItem(subItem) ? "active" : ""}`}
                                    >
                                      <Link
                                        href={normalizeHref(subItem.menu_item.url)}
                                        aria-label={subItem.menu_item.title}
                                        onClick={closeMenu}
                                        className={`font-heading font-normal text-heading-6 duration-300 ease-linear hover:text-gold ${isActiveSubMenuItem(subItem) ? "text-gold" : ""}`}
                                        target={subItem.menu_item.target || "_self"}
                                        rel={
                                          subItem.menu_item.target === "_blank"
                                            ? "noopener noreferrer"
                                            : undefined
                                        }
                                      >
                                        {subItem.menu_item.title}
                                      </Link>
                                    </li>
                                  )
                                )}
                              </ul>
                            )}
                        </div>
                      </div>
                      <div className="max-xl:hidden p-0 flex flex-1 flex-col justify-start gap-[1.375vw] rounded-10 relative overflow-hidden bg-black-600/0 ease-linear cursor-auto">
                        {menuMedia.length > 0 && (
                          <div className="cta max-w-861 mx-auto w-full">
                            <div className="grid grid-cols-1 gap-15">
                              {menuMedia.map((media, idx) => {
                                const isGif =
                                  typeof media.url === "string" &&
                                  media.url.toLowerCase().includes(".gif");
                                return (
                                  <div
                                    key={`${media.url}-${idx}`}
                                    className="img rounded-10 overflow-hidden"
                                  >
                                    <Image
                                      src={media.url}
                                      alt={media.alt}
                                      aria-label={media.alt}
                                      width={400}
                                      height={600}
                                      sizes="(min-width: 1280px) 400px, 33vw"
                                      className="w-full h-auto object-cover"
                                      unoptimized
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {headerData.header_lets_talk && (
                          <Link
                            href={headerData.header_lets_talk.url}
                            aria-label={headerData.header_lets_talk.title}
                            onClick={closeMenu}
                            className="call-btn ring-shake-parent group capitalize hover:text-gold max-sm:text-body-6 text-body-1 font-heading flex justify-center items-center gap-10 relative duration-300 ease-linear"
                          >
                            <span className="ring-shake">
                              <svg
                                className="max-sm:size-18 block"
                                width="22"
                                height="22"
                                viewBox="0 0 800 800"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  className="group-hover:stroke-gold duration-300 ease-linear"
                                  d="M732.333 611C732.333 623 729.667 635.333 724 647.333C718.333 659.333 711 670.667 701.333 681.333C685 699.333 667 712.333 646.667 720.667C626.667 729 605 733.333 581.667 733.333C547.667 733.333 511.333 725.333 473 709C434.667 692.667 396.333 670.667 358.333 643C320 615 283.667 584 249 549.667C214.667 515 183.667 478.667 156 440.667C128.667 402.667 106.667 364.667 90.6667 327C74.6667 289 66.6667 252.667 66.6667 218C66.6667 195.333 70.6667 173.667 78.6667 153.667C86.6667 133.333 99.3334 114.667 117 98C138.333 77 161.667 66.6667 186.333 66.6667C195.667 66.6667 205 68.6667 213.333 72.6667C222 76.6667 229.667 82.6667 235.667 91.3334L313 200.333C319 208.667 323.333 216.333 326.333 223.667C329.333 230.667 331 237.667 331 244C331 252 328.667 260 324 267.667C319.667 275.333 313.333 283.333 305.333 291.333L280 317.667C276.333 321.333 274.667 325.667 274.667 331C274.667 333.667 275 336 275.667 338.667C276.667 341.333 277.667 343.333 278.333 345.333C284.333 356.333 294.667 370.667 309.333 388C324.333 405.333 340.333 423 357.667 440.667C375.667 458.333 393 474.667 410.667 489.667C428 504.333 442.333 514.333 453.667 520.333C455.333 521 457.333 522 459.667 523C462.333 524 465 524.333 468 524.333C473.667 524.333 478 522.333 481.667 518.667L507 493.667C515.333 485.333 523.333 479 531 475C538.667 470.333 546.333 468 554.667 468C561 468 567.667 469.333 575 472.333C582.333 475.333 590 479.667 598.333 485.333L708.667 563.667C717.333 569.667 723.333 576.667 727 585C730.333 593.333 732.333 601.667 732.333 611Z"
                                  stroke="currentColor"
                                  strokeWidth="50"
                                  strokeMiterlimit="10"
                                />
                                <path
                                  className="group-hover:stroke-gold duration-300 ease-linear"
                                  d="M616.667 300C616.667 280 601 249.333 577.667 224.333C556.333 201.333 528 183.333 500 183.333"
                                  stroke="currentColor"
                                  strokeWidth="50"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  className="group-hover:stroke-gold duration-300 ease-linear"
                                  d="M733.333 300C733.333 171 629 66.6667 500 66.6667"
                                  stroke="currentColor"
                                  strokeWidth="50"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                            <span>{headerData.header_lets_talk.title}</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div
        className={`${hoveredIndex !== null ? "opacity-100 visible" : "invisible opacity-0"} duration-300 delay-150 ease-linear backdrop-blur-xs absolute size-full top-0 left-0 bg-black/50 pointer-events-none z-30`}
      ></div>
    </>
  );
};

export default PageHeader;
