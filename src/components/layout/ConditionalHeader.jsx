"use client";
import { usePathname } from "next/navigation";
import PageHeader from "./PageHeader";

export default function ConditionalHeader({ headerData }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/company-profile")) return null;
  return <PageHeader headerData={headerData} />;
}
