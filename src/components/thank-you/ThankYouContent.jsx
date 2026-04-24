"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const formConfig = {
  contact: {
    heading: "<span class='text-gold!'>Our Expert</span> Will Connect You Soon",
    message:
      "We are delighted to assist you! Whether you are an independent consultant, an enterprise, a new start-up, or an IT organization, we eagerly look forward to collaborating with you!",
    message2: "Have a great day, Ahead, and talk to you soon!",
    cta: { label: "Back to Home", href: "/" },
  },
  "blog-sidebar": {
    heading: "<span class='text-gold!'>Our Expert</span> Will Connect You Soon",
    message:
      "We are delighted to assist you! Whether you are an independent consultant, an enterprise, a new start-up, or an IT organization, we eagerly look forward to collaborating with you!",
    message2: "Have a great day, Ahead, and talk to you soon!",
    cta: { label: "Back to Blog", href: "/blog" },
  },
  "blog-bottom": {
    heading: "<span class='text-gold!'>Our Expert</span> Will Connect You Soon",
    message:
      "We are delighted to assist you! Whether you are an independent consultant, an enterprise, a new start-up, or an IT organization, we eagerly look forward to collaborating with you!",
    message2: "Have a great day, Ahead, and talk to you soon!",
    cta: { label: "Back to Blog", href: "/blog" },
  },
  career: {
    heading: "Our Expert Will Connect You Soon",
    message:
      "We are delighted to assist you! Whether you are an independent consultant, an enterprise, a new start-up, or an IT organization, we eagerly look forward to collaborating with you!",
    message2: "Have a great day, Ahead, and talk to you soon!",
    cta: { label: "View Open Positions", href: "/careers" },
  },
};

const defaultConfig = {
  heading: "<span class='text-gold!'>Our Expert</span> Will Connect You Soon",
  message:
    "We are delighted to assist you! Whether you are an independent consultant, an enterprise, a new start-up, or an IT organization, we eagerly look forward to collaborating with you!",
  message2: "Have a great day, Ahead, and talk to you soon!",
  cta: { label: "Back to Home", href: "/" },
};

export default function ThankYouContent() {
  const searchParams = useSearchParams();
  const from = searchParams?.get("from") || "";
  const config = formConfig[from] || defaultConfig;

  return (
    <div className="max-w-[640px] mx-auto text-center flex flex-col items-center gap-30">
      <div className="thank-you-icon relative flex items-center justify-center size-80 rounded-full border-2 border-[var(--color-gold)] bg-[var(--color-gold)]/10">
        <span className="thank-you-icon-halo" aria-hidden="true"></span>
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-1"
          aria-hidden="true"
        >
          <path d="M20 6L9 17l-5-5" className="check-path" />
        </svg>
      </div>

      <div className="title title-white text-center">
        <h1 dangerouslySetInnerHTML={{ __html: config.heading }} />
      </div>

      <div className="content text-center">
        <p>{config.message}</p>
      </div>
      <div className="content text-center">
        <p>{config.message2}</p>
      </div>
      <Link href={config.cta.href} aria-label={config.cta.label} className="btn mt-10">
        <span className="btn-txt">
          {config.cta.label}
          <span className="btn-txt-extra" data-txt={config.cta.label}></span>
        </span>
      </Link>
    </div>
  );
}
