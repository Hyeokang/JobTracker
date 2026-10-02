"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiUrl, csrfFetch } from "@/lib/api";

type AuthenticatedUser = {
  id: string;
  email: string;
  displayName: string;
};

const summaryCards = [
  { label: "저장한 공고", value: 0, color: "bg-slate-950 text-white" },
  { label: "진행 중 지원", value: 0, color: "bg-blue-600 text-white" },
  { label: "예정된 일정", value: 0, color: "bg-white text-slate-950" },
];

export function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
          setLoadError(true);
          return;
        }

        setUser((await response.json()) as AuthenticatedUser);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setLoadError(true);
        }
      }
    }

    loadUser();
    return () => controller.abort();
  }, [router]);

  async function logout() {
    setIsLoggingOut(true);
    try {
      const response = await csrfFetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.replace("/login");
        return;
      }
      setLoadError(true);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (loadError) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f7fb] px-6">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">대시보드를 불러오지 못했습니다</h1>
          <p className="mt-3 text-slate-600">서버 연결을 확인한 뒤 다시 시도해 주세요.</p>
          <button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white">다시 시도</button>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f7fb]">
        <p className="text-sm font-medium text-slate-500">내 정보를 불러오는 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-lg font-bold text-white">J</span>
            <span className="font-bold">JobTracker</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
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

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div>
          <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">My workspace</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{user.displayName}님의 취업 준비 현황</h1>
          <p className="mt-3 text-slate-600">저장한 공고와 지원 기록을 기준으로 보여드려요.</p>
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-3" aria-label="지원 현황 요약">
          {summaryCards.map((card) => (
            <article key={card.label} className={`rounded-3xl border border-slate-200 p-6 shadow-sm ${card.color}`}>
              <p className="text-sm opacity-70">{card.label}</p>
              <p className="mt-5 text-4xl font-bold">{card.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="mx-auto max-w-xl text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-2xl text-blue-700">+</span>
            <h2 className="mt-5 text-2xl font-bold">첫 채용공고를 준비해 보세요</h2>
            <p className="mt-3 leading-7 text-slate-600">다음 단계에서 공고를 직접 등록하고 관리하는 기능이 이곳에 연결됩니다.</p>
            <span className="mt-6 inline-flex rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-500">공고 등록 기능 준비 중</span>
          </div>
        </section>
      </div>
    </main>
  );
}
