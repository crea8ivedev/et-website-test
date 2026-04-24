"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const PACK_LOADERS = {
  Ri: () => import("react-icons/ri"),
  Fa: () => import("react-icons/fa"),
  Lu: () => import("react-icons/lu"),
  Hi: () => import("react-icons/hi"),
  Md: () => import("react-icons/md"),
  Fc: () => import("react-icons/fc"),
  Gr: () => import("react-icons/gr"),
  Io: () => import("react-icons/io5"),
  Tb: () => import("react-icons/tb"),
  Si: () => import("react-icons/si"),
  Bi: () => import("react-icons/bi"),
  Bs: () => import("react-icons/bs"),
  Cg: () => import("react-icons/cg"),
  Fi: () => import("react-icons/fi"),
  Gi: () => import("react-icons/gi"),
  Vsc: () => import("react-icons/vsc"),
  Pi: () => import("react-icons/pi"),
  Ai: () => import("react-icons/ai"),
  Rx: () => import("react-icons/rx"),
};

async function loadIcon(name) {
  const prefix = name.match(/^[A-Z][a-z]+/)?.[0];
  if (!prefix) return null;

  const loader = PACK_LOADERS[prefix];
  if (loader) {
    const mod = await loader();
    if (mod[name]) return mod[name];
  }

  // fa6 icons share the "Fa" prefix with fa — try fa6 as fallback
  if (prefix === "Fa") {
    const fa6 = await import("react-icons/fa6");
    if (fa6[name]) return fa6[name];
  }

  return null;
}

export default function DynamicIcon({
  name,
  className,
  fallbackSrc,
  fallbackAlt = "",
  fallbackWidth = 64,
  fallbackHeight = 64,
  fallbackStyle,
}) {
  const [Icon, setIcon] = useState(null);

  const iconName = typeof name === "string" ? name.replace(/[<> /]/g, "") : null;

  useEffect(() => {
    if (!iconName) return;
    let cancelled = false;
    loadIcon(iconName).then((component) => {
      if (!cancelled && component) setIcon(() => component);
    });
    return () => {
      cancelled = true;
    };
  }, [iconName]);

  if (Icon) return <Icon className={className} />;

  if (fallbackSrc) {
    return (
      <Image
        src={fallbackSrc}
        width={fallbackWidth}
        height={fallbackHeight}
        alt={fallbackAlt}
        className={className}
        style={fallbackStyle}
      />
    );
  }

  return null;
}
