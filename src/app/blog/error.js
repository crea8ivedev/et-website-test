"use client";

import ErrorFallback from "@/components/errors/ErrorFallback";

export default function Error({ error, reset }) {
  return (
    <ErrorFallback
      scope="blog/error"
      error={error}
      reset={reset}
      message="An unexpected error occurred while loading this page. Please try again later."
    />
  );
}
