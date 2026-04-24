"use client";
import React from "react";
import { safeParse } from "@/utils/safeParse";
import { Reveal } from "@/components/common/Reveal";

const allCards = [
  { label: "Consumer Electronics", emoji: "💻", sub: "Smart devices & gadgets" },
  { label: "Food & Beverage", emoji: "🍽️", sub: "Restaurants & brands" },
  { label: "Retail & Apparel", emoji: "👗", sub: "Fashion & lifestyle" },
  { label: "Health & Wellness", emoji: "🧘", sub: "Fitness & mindfulness" },
  { label: "DTC Travel", emoji: "✈️", sub: "Direct-to-consumer" },
  { label: "Subscription eCommerce", emoji: "📦", sub: "Recurring revenue" },
  { label: "Cannabis & Beverage", emoji: "🌿", sub: "Emerging markets" },
  { label: "Logistics & Supply", emoji: "🚚", sub: "End-to-end solutions" },
];

const col1Cards = [...allCards, ...allCards];
const col2Cards = [
  ...allCards.slice(3),
  ...allCards.slice(0, 3),
  ...allCards.slice(3),
  ...allCards.slice(0, 3),
];
const col3Cards = [
  ...allCards.slice(5),
  ...allCards.slice(0, 5),
  ...allCards.slice(5),
  ...allCards.slice(0, 5),
];
const col4Cards = [
  ...allCards.slice(1),
  ...allCards.slice(0, 1),
  ...allCards.slice(1),
  ...allCards.slice(0, 1),
];

function IndustryCard({ item }) {
  return (
    <div
      className="relative rounded-10 overflow-hidden flex-shrink-0 mb-30 w-full p-20 border border-black-700"
      style={{ height: "250px" }}
    >
      <div className="absolute top-6 right-6 size-[6vw] rounded-full blur-2xl opacity-5 pointer-events-none bg-black-100" />
      <div className="flex flex-col justify-between h-full z-10 opacity-20">
        <span className="text-3xl leading-none opacity-50">{item.emoji}</span>
        <div>
          <div className="title title-white mb-5">
            <h3 className="h6">{item.label}</h3>
          </div>
          <div className="content sm">
            <p>{item.sub}</p>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-20 -right-20 size-[5vw] rounded-full opacity-15 pointer-events-none blur-xs bg-black-100/0" />
    </div>
  );
}

function MarqueeCol({ cards, duration, offsetTop = 0 }) {
  return (
    <div
      className="overflow-hidden flex-shrink-0 max-md:first:hidden max-md:last:hidden max-md:w-[50vw] w-[25vw]"
      style={{ height: "100vh", marginTop: offsetTop }}
    >
      <div
        className="industries-col-track flex flex-col"
        style={{ "--marquee-duration": `${duration}s` }}
      >
        {cards.map((card, i) => (
          <IndustryCard key={i} item={card} />
        ))}
      </div>
    </div>
  );
}

export default function IndustriesHelped({ data }) {
  if (data?.hide_section === "yes") return null;

  const industries = [
    "Consumer Electronics",
    "Cannabis & Beverage",
    "Health & Wellness",
    "DTC Travel & Lifestyle",
    "Food & Beverage",
    "Subscription eCommerce",
    "Retail & Apparel",
    "Logistics & Supply Chain",
  ];

  return (
    <section
      className="industries-wrapper relative overflow-hidden"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="absolute inset-0 flex justify-center gap-30"
        style={{ pointerEvents: "none" }}
      >
        <MarqueeCol cards={col1Cards} duration={66} offsetTop={0} />
        <MarqueeCol cards={col2Cards} duration={106} offsetTop={-20} />
        <MarqueeCol cards={col3Cards} duration={96} offsetTop={-40} />
        <MarqueeCol cards={col4Cards} duration={66} offsetTop={-20} />
      </div>

      {[
        {
          style: {
            inset: 0,
            right: "auto",
            width: "30%",
            background: "linear-gradient(to right, #1a1a1a, 80%, transparent)",
          },
        },
        {
          style: {
            inset: 0,
            left: "auto",
            width: "30%",
            background: "linear-gradient(to left, #1a1a1a, 80%, transparent)",
          },
        },
        {
          style: {
            inset: 0,
            bottom: "auto",
            height: "15%",
            background: "linear-gradient(to bottom, #1a1a1a, transparent)",
          },
        },
        {
          style: {
            inset: 0,
            top: "auto",
            height: "15%",
            background: "linear-gradient(to top, #1a1a1a, 80%, transparent)",
          },
        },
      ].map((f, i) => (
        <div key={i} className="absolute z-10 pointer-events-none" style={f.style} />
      ))}

      <div
        className="absolute z-10 pointer-events-none rounded-full"
        style={{
          width: 700,
          height: 500,
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.16) 0%, transparent 70%)",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
        }}
      />
      <div className="container-fluid-lg !z-20">
        <div className="relative text-center mx-auto" style={{ maxWidth: 720 }}>
          <div className="title title-white mb-20">
            <Reveal as="h2" delay={100}>
              {data?.heading ? (
                safeParse(data.heading)
              ) : (
                <>
                  Industries <span>We&apos;ve Helped</span> Become More Inclusive
                </>
              )}
            </Reveal>
          </div>

          <div className="content mb-40">
            <Reveal as="p" delay={200}>
              {data?.description ||
                "Encircle has delivered results across a diverse range of industries..."}
            </Reveal>
          </div>

          <Reveal direction="none" delay={300} className="flex flex-wrap justify-center gap-10">
            {(data?.industries || industries).map((item, index) => (
              <span
                key={index}
                className="py-5 px-15 rounded-full text-xs font-medium bg-black-50/5 border border-black-100/50 backdrop-blur-sm"
              >
                {typeof item === "string" ? item : item.title}
              </span>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
