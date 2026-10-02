"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { PageLoadError, PageLoading } from "@/components/auth-state";
import { useCurrentUser } from "@/hooks/use-current-user";
import { employmentTypeLabels, fetchJobs, type JobPosting } from "@/lib/jobs";

export function JobList() {
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

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AppHeader user={user} />
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">Saved jobs</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">채용공고</h1>
            <p className="mt-3 text-slate-600">내가 저장한 채용공고 {jobs.length}건을 확인할 수 있습니다.</p>
          </div>
          <Link href="/jobs/new" className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700">
            새 공고 등록
          </Link>
        </div>

        {jobs.length === 0 ? (
          <section className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="text-xl font-bold">아직 저장한 공고가 없습니다</h2>
            <p className="mt-3 text-slate-600">관심 있는 채용공고를 직접 등록해 보세요.</p>
            <Link href="/jobs/new" className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white">첫 공고 등록하기</Link>
          </section>
        ) : (
          <section className="mt-10 grid gap-4" aria-label="채용공고 목록">
            {jobs.map((job) => (
              <article key={job.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-bold text-blue-600">{job.companyName}</p>
                    <h2 className="mt-2 text-xl font-bold sm:text-2xl">{job.title}</h2>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                      {job.position && <span className="rounded-full bg-slate-100 px-3 py-1.5">{job.position}</span>}
                      {job.employmentType && <span className="rounded-full bg-slate-100 px-3 py-1.5">{employmentTypeLabels[job.employmentType]}</span>}
                      {job.careerRequirement && <span className="rounded-full bg-slate-100 px-3 py-1.5">{job.careerRequirement}</span>}
                      {job.location && <span className="rounded-full bg-slate-100 px-3 py-1.5">{job.location}</span>}
                    </div>
                  </div>
                  <div className="shrink-0 text-sm text-slate-500 sm:text-right">
                    <p>{job.deadline ? `${job.deadline} 마감` : "마감일 미정"}</p>
                    {job.originalUrl && (
                      <a href={job.originalUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex font-semibold text-blue-600 hover:text-blue-700">
                        원문 보기 ↗
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
