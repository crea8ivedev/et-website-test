"use client";

import ErrorFallback from "@/components/errors/ErrorFallback";

export default function BlogDetailError({ error, reset }) {
  return (
    <ErrorFallback
      scope="blog/[...slug]/error"
      error={error}
      reset={reset}
      message="We could not load this blog post. Please try again later."
    />
  );
}
