"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import webTechnologyLogos from "@/data/webTechnologyLogoSlider.json";

export default function TechnologyLogoMarqueeRows({
  copies = ["a", "b"],
  rowClassName = "flex items-center gap-65",
  isCopyAriaHidden = (_copy, copyIndex) => copyIndex === 1,
  linkClassName,
  getItemLinkClassName,
  includeTitle = false,
  onItemMouseEnter,
  onItemMouseLeave,
  imageClassName,
  getImagePriority,
}) {
  return (
    <>
      {copies.map((copy, copyIndex) => (
        <div
          key={String(copy)}
          className={rowClassName}
          aria-hidden={isCopyAriaHidden(copy, copyIndex) ? "true" : undefined}
        >
          {webTechnologyLogos.map((item, i) => {
            const ariaLabel = item?.technology_link?.alt || "Technology Logo";
            const perItemClassName = getItemLinkClassName
              ? getItemLinkClassName(i, copy, copyIndex)
              : "";
            const className =
              [linkClassName, perItemClassName].filter(Boolean).join(" ") || undefined;
            const priority = getImagePriority
              ? Boolean(getImagePriority(i, copy, copyIndex))
              : undefined;

            return (
              <Link
                key={`${copy}-${i}`}
                href={item?.technology_link?.url || "#"}
                target={item?.technology_link?.target || "_self"}
                aria-label={ariaLabel}
                title={includeTitle ? ariaLabel : undefined}
                className={className}
                onMouseEnter={
                  onItemMouseEnter ? () => onItemMouseEnter(i, copy, copyIndex) : undefined
                }
                onMouseLeave={
                  onItemMouseLeave ? () => onItemMouseLeave(i, copy, copyIndex) : undefined
                }
              >
                <Image
                  src={item.technology_logo}
                  width={100}
                  height={40}
                  alt={ariaLabel}
                  aria-label={ariaLabel}
                  className={imageClassName}
                  priority={priority}
                  sizes="100px"
                />
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}
