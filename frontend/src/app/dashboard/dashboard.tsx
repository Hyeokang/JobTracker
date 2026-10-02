"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { PageLoadError, PageLoading } from "@/components/auth-state";
import { useCurrentUser } from "@/hooks/use-current-user";
import { employmentTypeLabels, fetchJobs, type JobPosting } from "@/lib/jobs";

export function Dashboard() {
  const { user, isLoading: isUserLoading, hasError: hasUserError } = useCurrentUser();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isJobsLoading, setIsJobsLoading] = useState(true);
  const [hasJobsError, setHasJobsError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetchJobs(controller.signal)
      .then(async (response) => {
        if (response.status === 401) return;
        if (!response.ok) throw new Error("Failed to load jobs");
        setJobs((await response.json()) as JobPosting[]);
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setHasJobsError(true);
        }
      })
      .finally(() => setIsJobsLoading(false));

    return () => controller.abort();
  }, []);

  if (hasUserError || hasJobsError) return <PageLoadError />;
  if (isUserLoading || isJobsLoading || !user) return <PageLoading />;

  const summaryCards = [
    { label: "저장한 공고", value: jobs.length, color: "bg-slate-950 text-white" },
    { label: "진행 중 지원", value: 0, color: "bg-blue-600 text-white" },
    { label: "예정된 일정", value: 0, color: "bg-white text-slate-950" },
  ];

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AppHeader user={user} />

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">My workspace</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{user.displayName}님의 취업 준비 현황</h1>
            <p className="mt-3 text-slate-600">저장한 공고와 지원 기록을 기준으로 보여드려요.</p>
          </div>
          <Link href="/jobs/new" className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700">
            채용공고 등록
          </Link>
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
          {jobs.length === 0 ? (
            <div className="mx-auto max-w-xl text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-2xl text-blue-700">+</span>
              <h2 className="mt-5 text-2xl font-bold">첫 채용공고를 등록해 보세요</h2>
              <p className="mt-3 leading-7 text-slate-600">관심 있는 공고를 직접 입력하면 대시보드에서 한눈에 확인할 수 있습니다.</p>
              <Link href="/jobs/new" className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">공고 등록하기</Link>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600">RECENT JOBS</p>
                  <h2 className="mt-2 text-2xl font-bold">최근 저장한 공고</h2>
                </div>
                <Link href="/jobs" className="text-sm font-semibold text-blue-600">전체 보기</Link>
              </div>
              <div className="mt-6 divide-y divide-slate-100">
                {jobs.slice(0, 3).map((job) => (
                  <article key={job.id} className="flex flex-col justify-between gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-semibold text-blue-600">{job.companyName}</p>
                      <h3 className="mt-1 text-lg font-bold">{job.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {[job.position, job.employmentType ? employmentTypeLabels[job.employmentType] : null, job.location].filter(Boolean).join(" · ") || "상세 조건 미입력"}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500">{job.deadline ? `${job.deadline} 마감` : "상시 채용"}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
