"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";

export default function notfound() {
  return (
    <section className="inner-banner-wrapper max-lg:pb-50 pb-80 pt-148 relative overflow-hidden">
      <div className="container-fluid-lg">
        <div className="w-full">
          <div className="flex flex-col items-center justify-center gap-y-20 w-full">
            <div className="w-full max-w-460 h-460 relative flex flex-col items-center justify-center">
              <div className="ring-rotate absolute inset-0 flex items-center justify-center">
                <Image
                  src="/icons/ui/ring.png"
                  alt="404"
                  width={800}
                  height={800}
                  className="size-full object-contain"
                />
              </div>
              <div className="title title-white !text-gold ">
                <h1>404</h1>
              </div>
              <div className="title title-white">
                <h2 className="h5 !font-medium">Page Not Found</h2>
              </div>
            </div>
            <div className="content mb-20">
              <p className="text-white opacity-75 text-center">
                The page you are looking for does not exist.
              </p>
            </div>
            <Link href="/" className="btn btn-white">
              <span className="btn-txt">
                Go to Home
                <span className="btn-txt-extra" data-txt="Go to Home"></span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
