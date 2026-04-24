"use client";

import ErrorFallback from "@/components/errors/ErrorFallback";

export default function Error({ error, reset }) {
  return <ErrorFallback scope="slug/error" error={error} reset={reset} />;
}
