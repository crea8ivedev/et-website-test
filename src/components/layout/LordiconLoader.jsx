"use client";
import dynamic from "next/dynamic";

const LordiconPlayer = dynamic(() => import("@/components/layout/LordiconPlayer"), {
  ssr: false,
});

export default function LordiconLoader() {
  return <LordiconPlayer />;
}
