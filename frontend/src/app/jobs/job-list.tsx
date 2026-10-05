"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { PageLoadError, PageLoading } from "@/components/auth-state";
import { useCurrentUser } from "@/hooks/use-current-user";
import { applicationStatusLabels } from "@/lib/applications";
import {
  employmentTypeLabels,
  fetchJobs,
  recruitmentTypeLabels,
  type EmploymentType,
  type JobFilters,
  type JobPosting,
  type RecruitmentType,
} from "@/lib/jobs";
import { fetchSkills, type Skill } from "@/lib/skills";

const initialFilters: JobFilters = {
  keyword: "",
  company: "",
  career: "",
  location: "",
  employmentType: "",
  recruitmentType: "",
  skillId: "",
  applicationStatus: "",
  deadlineFrom: "",
  deadlineTo: "",
  savedFrom: "",
  savedTo: "",
};

export function JobList() {
  const router = useRouter();
  const { user, isLoading: isUserLoading, hasError: hasUserError } = useCurrentUser();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filters, setFilters] = useState<JobFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<JobFilters>(initialFilters);
  const [isJobsLoading, setIsJobsLoading] = useState(true);
  const [hasLoadedJobs, setHasLoadedJobs] = useState(false);
  const [hasJobsError, setHasJobsError] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchJobs(controller.signal, appliedFilters)
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        if (!response.ok) throw new Error("Failed to load jobs");
        setJobs((await response.json()) as JobPosting[]);
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setHasJobsError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsJobsLoading(false);
          setHasLoadedJobs(true);
        }
      });

    return () => controller.abort();
  }, [appliedFilters, router]);

  useEffect(() => {
    const controller = new AbortController();

    fetchSkills(controller.signal)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load skills");
        setSkills((await response.json()) as Skill[]);
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setHasJobsError(true);
        }
      });

    return () => controller.abort();
  }, []);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (filters.deadlineFrom && filters.deadlineTo && filters.deadlineFrom > filters.deadlineTo) {
      setFilterError("마감일 종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }
    if (filters.savedFrom && filters.savedTo && filters.savedFrom > filters.savedTo) {
      setFilterError("저장일 종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }
    setFilterError(null);
    setIsJobsLoading(true);
    setAppliedFilters({ ...filters });
  }

  function resetFilters() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setFilterError(null);
    setIsJobsLoading(true);
  }

  if (hasUserError || hasJobsError) return <PageLoadError />;
  if (isUserLoading || !hasLoadedJobs || !user) return <PageLoading />;

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

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

        <form onSubmit={applyFilters} className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="job-keyword" className="sr-only">통합 검색</label>
              <input
                id="job-keyword"
                value={filters.keyword ?? ""}
                onChange={(event) => setFilters({ ...filters, keyword: event.target.value })}
                placeholder="회사, 공고 제목, 직무 검색"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <button type="submit" disabled={isJobsLoading} className="rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
              {isJobsLoading ? "검색 중..." : "검색"}
            </button>
            <button type="button" onClick={resetFilters} disabled={isJobsLoading || activeFilterCount === 0} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40">
              초기화
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterInput label="회사" value={filters.company ?? ""} placeholder="회사명" onChange={(company) => setFilters({ ...filters, company })} />
            <FilterInput label="경력" value={filters.career ?? ""} placeholder="신입, 경력 3년" onChange={(career) => setFilters({ ...filters, career })} />
            <FilterInput label="지역" value={filters.location ?? ""} placeholder="서울, 경기" onChange={(location) => setFilters({ ...filters, location })} />
            <FilterSelect label="기술" value={filters.skillId ?? ""} onChange={(skillId) => setFilters({ ...filters, skillId })}>
              <option value="">전체 기술</option>
              {skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
            </FilterSelect>
            <FilterSelect label="고용 형태" value={filters.employmentType ?? ""} onChange={(employmentType) => setFilters({ ...filters, employmentType: employmentType as EmploymentType | "" })}>
              <option value="">전체 고용 형태</option>
              {Object.entries(employmentTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </FilterSelect>
            <FilterSelect label="채용 구분" value={filters.recruitmentType ?? ""} onChange={(recruitmentType) => setFilters({ ...filters, recruitmentType: recruitmentType as RecruitmentType | "" })}>
              <option value="">전체 채용 구분</option>
              {Object.entries(recruitmentTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </FilterSelect>
            <FilterSelect label="지원 상태" value={filters.applicationStatus ?? ""} onChange={(applicationStatus) => setFilters({ ...filters, applicationStatus: applicationStatus as JobFilters["applicationStatus"] })}>
              <option value="">전체 지원 상태</option>
              {Object.entries(applicationStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </FilterSelect>
          </div>

          <details className="mt-5 border-t border-slate-100 pt-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-600">날짜 범위 필터</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FilterDate label="마감일 시작" value={filters.deadlineFrom ?? ""} onChange={(deadlineFrom) => setFilters({ ...filters, deadlineFrom })} />
              <FilterDate label="마감일 종료" value={filters.deadlineTo ?? ""} onChange={(deadlineTo) => setFilters({ ...filters, deadlineTo })} />
              <FilterDate label="저장일 시작" value={filters.savedFrom ?? ""} onChange={(savedFrom) => setFilters({ ...filters, savedFrom })} />
              <FilterDate label="저장일 종료" value={filters.savedTo ?? ""} onChange={(savedTo) => setFilters({ ...filters, savedTo })} />
            </div>
          </details>
          {filterError && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{filterError}</p>}
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <p><strong className="text-slate-950">{jobs.length}</strong>개의 공고를 찾았습니다.</p>
          {activeFilterCount > 0 && <p>{activeFilterCount}개 조건 적용 중</p>}
        </div>

        {jobs.length === 0 ? (
          <section className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="text-xl font-bold">{activeFilterCount > 0 ? "조건에 맞는 공고가 없습니다" : "아직 저장한 공고가 없습니다"}</h2>
            <p className="mt-3 text-slate-600">{activeFilterCount > 0 ? "검색 조건을 변경하거나 초기화해 보세요." : "관심 있는 채용공고를 직접 등록해 보세요."}</p>
            {activeFilterCount > 0 ? (
              <button type="button" onClick={resetFilters} className="mt-6 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white">검색 초기화</button>
            ) : (
              <Link href="/jobs/new" className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white">첫 공고 등록하기</Link>
            )}
          </section>
        ) : (
          <section className="mt-10 grid gap-4" aria-label="채용공고 목록">
            {jobs.map((job) => (
              <article key={job.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-bold text-blue-600">{job.companyName}</p>
                    <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                      <Link href={`/jobs/${job.id}`} className="transition hover:text-blue-700">{job.title}</Link>
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                      {job.position && <span className="rounded-full bg-slate-100 px-3 py-1.5">{job.position}</span>}
                      {job.employmentType && <span className="rounded-full bg-slate-100 px-3 py-1.5">{employmentTypeLabels[job.employmentType]}</span>}
                      {job.recruitmentType && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">{recruitmentTypeLabels[job.recruitmentType]}</span>}
                      {job.careerRequirement && <span className="rounded-full bg-slate-100 px-3 py-1.5">{job.careerRequirement}</span>}
                      {job.location && <span className="rounded-full bg-slate-100 px-3 py-1.5">{job.location}</span>}
                    </div>
                    {job.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <span key={skill.id} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{skill.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-sm text-slate-500 sm:text-right">
                    <p>{job.deadline ? `${job.deadline} 마감` : "마감일 미정"}</p>
                    <Link href={`/jobs/${job.id}`} className="mt-3 inline-flex font-semibold text-slate-700 hover:text-blue-700">
                      상세 보기
                    </Link>
                    {job.originalUrl && (
                      <a href={job.originalUrl} target="_blank" rel="noreferrer" className="mt-3 ml-4 inline-flex font-semibold text-blue-600 hover:text-blue-700">
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

function FilterInput({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal outline-none focus:border-blue-500" />
    </label>
  );
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none focus:border-blue-500">
        {children}
      </select>
    </label>
  );
}

function FilterDate({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal outline-none focus:border-blue-500" />
    </label>
  );
}
