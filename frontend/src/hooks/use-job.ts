"use client";

import { useEffect, useState } from "react";
import { fetchJob, type JobPosting } from "@/lib/jobs";

export function useJob(jobPostingId: string) {
  const [job, setJob] = useState<JobPosting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetchJob(jobPostingId, controller.signal)
      .then(async (response) => {
        if (response.status === 401) return;
        if (response.status === 404) {
          setIsNotFound(true);
          return;
        }
        if (!response.ok) throw new Error("Failed to load job");
        setJob((await response.json()) as JobPosting);
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setHasError(true);
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [jobPostingId]);

  return { job, isLoading, hasError, isNotFound };
}
