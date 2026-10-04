"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { PageLoadError, PageLoading } from "@/components/auth-state";
import { JobForm } from "@/components/job-form";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useJob } from "@/hooks/use-job";

export function EditJob({ jobPostingId }: { jobPostingId: string }) {
  const { user, isLoading: isUserLoading, hasError: hasUserError } = useCurrentUser();
  const { job, isLoading: isJobLoading, hasError: hasJobError, isNotFound } = useJob(jobPostingId);

  if (hasUserError || hasJobError) return <PageLoadError />;
  if (isUserLoading || isJobLoading || !user) return <PageLoading />;
  if (isNotFound || !job) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f7fb] px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">수정할 채용공고를 찾을 수 없습니다</h1>
          <Link href="/jobs" className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white">목록으로 이동</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AppHeader user={user} />
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
        <Link href={`/jobs/${job.id}`} className="text-sm font-semibold text-slate-500 hover:text-blue-700">← 채용공고 상세</Link>
        <div className="mt-5">
          <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">Edit job</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">채용공고 수정</h1>
          <p className="mt-3 text-slate-600">변경된 채용 조건이나 일정을 최신 정보로 관리하세요.</p>
        </div>
        <JobForm job={job} />
      </div>
    </main>
  );
}
