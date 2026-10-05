"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { csrfFetch } from "@/lib/api";
import type { AuthenticatedUser } from "@/lib/auth";

export function AppHeader({ user }: { user: AuthenticatedUser }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    setIsLoggingOut(true);
    try {
      const response = await csrfFetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.replace("/login");
        return;
      }
      window.alert("로그아웃하지 못했습니다. 다시 시도해 주세요.");
    } catch {
      window.alert("서버에 연결할 수 없습니다.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-5 lg:px-10">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-lg font-bold text-white">J</span>
            <span className="hidden font-bold sm:inline">JobTracker</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm font-semibold text-slate-600" aria-label="주요 메뉴">
            <Link href="/dashboard" className="transition hover:text-blue-700">대시보드</Link>
            <Link href="/jobs" className="transition hover:text-blue-700">채용공고</Link>
            <Link href="/applications" className="transition hover:text-blue-700">지원 현황</Link>
            <Link href="/calendar" className="transition hover:text-blue-700">일정</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold">{user.displayName}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={isLoggingOut}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-50"
          >
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
        </div>
      </div>
    </header>
  );
}
