"use client";
import React from "react";
import Image from "next/image";
import { safeParse } from "@/utils/safeParse";

export default function ClientFeedback({ data }) {
  if (data?.hide_section === "yes") return null;

  const rating = data?.rating || "4";

  return (
    <section className="client-feedback py-80 max-lg:py-40">
      <div className="container-fluid-lg">
        {data?.heading && (
          <div className="title title-white text-center">
            <h2>{safeParse(data.heading)}</h2>
          </div>
        )}
        <div className="text-center pt-30 max-w-850 mx-auto">
          <div className="flex flex-col gap-y-25">
            {data?.post && <i>{data.post}</i>}
            {data?.feedback && <h4>{safeParse(data.feedback)}</h4>}
          </div>
          <div className="rating flex flex-wrap items-center justify-center gap-30 pt-30">
            <span>Rated: {rating}/5</span>
            <ul className="flex flex-wrap">
              {[...Array(5)].map((_, i) => (
                <li key={i}>
                  <Image
                    src="/icons/ui/light_star.svg"
                    width={30}
                    height={30}
                    alt="star"
                    title="Star"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
