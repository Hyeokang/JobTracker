"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import type { AuthenticatedUser } from "@/lib/auth";

export function useCurrentUser() {
  const router = useRouter();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        if (!response.ok) {
          setHasError(true);
          return;
        }

        setUser((await response.json()) as AuthenticatedUser);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setHasError(true);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
    return () => controller.abort();
  }, [router]);

  return { user, isLoading, hasError };
}
