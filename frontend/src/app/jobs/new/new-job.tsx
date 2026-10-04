"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { PageLoadError, PageLoading } from "@/components/auth-state";
import { JobForm } from "@/components/job-form";
import { useCurrentUser } from "@/hooks/use-current-user";

export function NewJob() {
  const { user, isLoading, hasError } = useCurrentUser();

  if (hasError) return <PageLoadError />;
  if (isLoading || !user) return <PageLoading />;

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AppHeader user={user} />
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
        <Link href="/jobs" className="text-sm font-semibold text-slate-500 hover:text-blue-700">← 채용공고 목록</Link>
        <div className="mt-5">
          <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">New job</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">채용공고 직접 등록</h1>
          <p className="mt-3 text-slate-600">확인한 공고 정보를 입력해 저장하세요. 비어 있는 항목은 나중에 보완할 수 있습니다.</p>
        </div>
        <JobForm />
      </div>
    </main>
  );
}
