"use client";

import ErrorFallback from "@/components/errors/ErrorFallback";

export default function CaseStudyDetailError({ error, reset }) {
  return (
    <ErrorFallback
      scope="case-study/[...slug]/error"
      error={error}
      reset={reset}
      message="We could not load this case study. Please try again later."
    />
  );
}
