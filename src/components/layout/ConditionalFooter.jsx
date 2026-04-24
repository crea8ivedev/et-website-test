"use client";
import { usePathname } from "next/navigation";
import PageFooter from "./PageFooter";

export default function ConditionalFooter({ footerData }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/company-profile")) return null;
  return <PageFooter footerData={footerData} />;
}
