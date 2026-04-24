"use client";

import ErrorFallback from "@/components/errors/ErrorFallback";

export default function Error({ error, reset }) {
  return <ErrorFallback scope="app/error" error={error} reset={reset} />;
}
