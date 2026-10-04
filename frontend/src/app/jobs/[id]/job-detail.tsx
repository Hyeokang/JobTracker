"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { PageLoadError, PageLoading } from "@/components/auth-state";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useJob } from "@/hooks/use-job";
import { deleteJob, employmentTypeLabels, recruitmentTypeLabels } from "@/lib/jobs";

export function JobDetail({ jobPostingId }: { jobPostingId: string }) {
  const router = useRouter();
  const { user, isLoading: isUserLoading, hasError: hasUserError } = useCurrentUser();
  const { job, isLoading: isJobLoading, hasError: hasJobError, isNotFound } = useJob(jobPostingId);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm("이 채용공고를 삭제할까요? 삭제한 공고는 복구할 수 없습니다.")) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await deleteJob(jobPostingId);
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) {
        setDeleteError("채용공고를 삭제하지 못했습니다. 다시 시도해 주세요.");
        return;
      }
      router.replace("/jobs");
    } catch {
      setDeleteError("서버에 연결할 수 없습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (hasUserError || hasJobError) return <PageLoadError />;
  if (isUserLoading || isJobLoading || !user) return <PageLoading />;
  if (isNotFound || !job) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f7fb] px-6 text-center">
        <div>
          <p className="text-sm font-bold text-blue-600">404</p>
          <h1 className="mt-3 text-2xl font-bold">채용공고를 찾을 수 없습니다</h1>
          <p className="mt-3 text-slate-600">삭제되었거나 접근할 수 없는 공고입니다.</p>
          <Link href="/jobs" className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white">목록으로 이동</Link>
        </div>
      </main>
    );
  }

  const attributes = [
    job.position,
    job.employmentType ? employmentTypeLabels[job.employmentType] : null,
    job.recruitmentType ? recruitmentTypeLabels[job.recruitmentType] : null,
    job.careerRequirement,
    job.location,
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AppHeader user={user} />
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-14">
        <Link href="/jobs" className="text-sm font-semibold text-slate-500 hover:text-blue-700">← 채용공고 목록</Link>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-bold text-blue-600">{job.companyName}</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{job.title}</h1>
              {attributes.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-600">
                  {attributes.map((attribute, index) => <span key={`${attribute}-${index}`} className="rounded-full bg-slate-100 px-3 py-1.5">{attribute}</span>)}
                </div>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <Link href={`/jobs/${job.id}/edit`} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">수정</Link>
              <button type="button" onClick={handleDelete} disabled={isDeleting} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>

          {deleteError && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</p>}

          <div className="mt-9 grid gap-4 border-y border-slate-100 py-7 sm:grid-cols-3">
            <Info label="모집 시작일" value={job.startedDate ?? "미정"} />
            <Info label="마감일" value={job.deadline ?? "미정"} />
            <Info label="저장일" value={job.createdAt.slice(0, 10)} />
          </div>

          <div className="mt-8 grid gap-8">
            <section>
              <h2 className="text-lg font-bold">기술스택</h2>
              {job.skills.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span key={skill.id} className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">{skill.name}</span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-slate-600">등록된 기술이 없습니다.</p>
              )}
            </section>
            <DetailSection title="자격요건" content={job.requirements} />
            <DetailSection title="우대사항" content={job.preferredQualifications} />
          </div>

          {job.originalUrl && (
            <a href={job.originalUrl} target="_blank" rel="noreferrer" className="mt-9 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white">
              원본 채용공고 보기 ↗
            </a>
          )}
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-semibold text-slate-400">{label}</p><p className="mt-2 font-semibold">{value}</p></div>;
}

function DetailSection({ title, content }: { title: string; content: string | null }) {
  return <section><h2 className="text-lg font-bold">{title}</h2><p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">{content ?? "입력된 내용이 없습니다."}</p></section>;
}
