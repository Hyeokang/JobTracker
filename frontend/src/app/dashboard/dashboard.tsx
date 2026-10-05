"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppHeader } from "@/components/app-header";
import { PageLoadError, PageLoading } from "@/components/auth-state";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  applicationStatusLabels,
  fetchApplicationActivities,
  fetchApplications,
  type Application,
  type ApplicationActivity,
  type ApplicationStatus,
} from "@/lib/applications";
import { calendarItemTypeLabels, fetchCalendarItems, type CalendarItem } from "@/lib/calendar";
import { employmentTypeLabels, fetchJobs, recruitmentTypeLabels, type JobPosting } from "@/lib/jobs";

const stageRanks: Record<ApplicationStatus, number> = {
  INTERESTED: 0,
  PLANNED: 0,
  APPLIED: 1,
  DOCUMENT: 2,
  CODING_TEST: 3,
  INTERVIEW_1: 4,
  INTERVIEW_2: 4,
  FINAL: 5,
  ACCEPTED: 5,
  REJECTED: 0,
  WITHDRAWN: 0,
};

const calendarTypeStyles = {
  DEADLINE: "bg-rose-100 text-rose-700",
  CODING_TEST: "bg-amber-100 text-amber-800",
  INTERVIEW: "bg-blue-100 text-blue-700",
  RESULT: "bg-emerald-100 text-emerald-700",
  PERSONAL: "bg-violet-100 text-violet-700",
} as const;

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatActivityTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function Dashboard() {
  const router = useRouter();
  const { user, isLoading: isUserLoading, hasError: hasUserError } = useCurrentUser();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activities, setActivities] = useState<ApplicationActivity[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<CalendarItem[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [hasDashboardError, setHasDashboardError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const today = new Date();
    const rangeEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

    Promise.all([
      fetchJobs(controller.signal),
      fetchApplications(controller.signal),
      fetchApplicationActivities(controller.signal),
      fetchCalendarItems(dateKey(today), dateKey(rangeEnd), controller.signal),
    ])
      .then(async (responses) => {
        if (responses.some((response) => response.status === 401)) {
          router.replace("/login");
          return;
        }
        if (responses.some((response) => !response.ok)) {
          throw new Error("Failed to load dashboard");
        }

        const [jobsResponse, applicationsResponse, activitiesResponse, calendarResponse] = responses;
        setJobs((await jobsResponse.json()) as JobPosting[]);
        setApplications((await applicationsResponse.json()) as Application[]);
        setActivities((await activitiesResponse.json()) as ApplicationActivity[]);
        setUpcomingItems((await calendarResponse.json()) as CalendarItem[]);
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setHasDashboardError(true);
        }
      })
      .finally(() => setIsDashboardLoading(false));

    return () => controller.abort();
  }, [router]);

  const funnelData = useMemo(() => {
    const highestStageByApplication = new Map<string, number>();
    activities.forEach((activity) => {
      const rank = stageRanks[activity.newStatus];
      highestStageByApplication.set(
        activity.applicationId,
        Math.max(highestStageByApplication.get(activity.applicationId) ?? 0, rank),
      );
    });

    return [
      { name: "지원", rank: 1 },
      { name: "서류", rank: 2 },
      { name: "코딩테스트", rank: 3 },
      { name: "면접", rank: 4 },
      { name: "최종 결과", rank: 5 },
    ].map((stage) => ({
      name: stage.name,
      count: [...highestStageByApplication.values()].filter((rank) => rank >= stage.rank).length,
    }));
  }, [activities]);

  if (hasUserError || hasDashboardError) return <PageLoadError />;
  if (isUserLoading || isDashboardLoading || !user) return <PageLoading />;

  const ongoingStatuses: ApplicationStatus[] = ["APPLIED", "DOCUMENT", "CODING_TEST", "INTERVIEW_1", "INTERVIEW_2", "FINAL"];
  const currentOngoingCount = applications.filter((application) => ongoingStatuses.includes(application.status)).length;
  const submittedCount = funnelData[0].count;
  const summaryCards = [
    { label: "저장한 공고", value: jobs.length, detail: "내가 저장한 전체 공고", color: "bg-slate-950 text-white" },
    { label: "지원 완료", value: submittedCount, detail: "지원 단계에 도달한 공고", color: "bg-blue-600 text-white" },
    { label: "진행 중 지원", value: currentOngoingCount, detail: "현재 전형이 진행 중", color: "bg-white text-slate-950" },
    { label: "30일 내 일정", value: upcomingItems.length, detail: "공고 마감 및 등록 일정", color: "bg-white text-slate-950" },
  ];

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AppHeader user={user} />
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">My workspace</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{user.displayName}님의 취업 준비 현황</h1>
            <p className="mt-3 text-slate-600">내가 저장한 공고와 지원 활동 데이터를 기준으로 보여드려요.</p>
          </div>
          <Link href="/jobs/new" className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700">채용공고 등록</Link>
        </div>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="지원 현황 요약">
          {summaryCards.map((card) => (
            <article key={card.label} className={`rounded-3xl border border-slate-200 p-6 shadow-sm ${card.color}`}>
              <p className="text-sm opacity-70">{card.label}</p>
              <p className="mt-4 text-4xl font-bold">{card.value}</p>
              <p className="mt-3 text-xs opacity-60">{card.detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-600">APPLICATION FUNNEL</p>
                <h2 className="mt-2 text-2xl font-bold">지원 단계 도달 현황</h2>
                <p className="mt-2 text-sm text-slate-500">상태 변경 이력을 기준으로 각 단계에 도달한 지원 수입니다.</p>
              </div>
              <Link href="/applications" className="shrink-0 text-sm font-semibold text-blue-600">Kanban 보기</Link>
            </div>
            {submittedCount === 0 ? (
              <div className="mt-8 grid h-64 place-items-center rounded-2xl border border-dashed border-slate-300 text-center text-sm text-slate-500">지원 상태를 기록하면 Funnel이 표시됩니다.</div>
            ) : (
              <div className="mt-6 h-72" aria-label="지원 Funnel 차트">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ top: 8, right: 36, bottom: 8, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={78} axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
                    <Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [`${value}건`, "도달 지원"]} />
                    <Bar dataKey="count" fill="#2563eb" radius={[0, 8, 8, 0]} barSize={26}>
                      <LabelList dataKey="count" position="right" fill="#0f172a" fontSize={12} fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <SectionHeading eyebrow="UPCOMING" title="다가오는 일정" href="/calendar" linkLabel="달력 보기" />
            <div className="mt-6 space-y-3">
              {upcomingItems.slice(0, 5).map((item) => (
                <div key={`${item.type}-${item.id}`} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${calendarTypeStyles[item.type]}`}>{calendarItemTypeLabels[item.type]}</span>
                      <p className="mt-2 truncate font-bold">{item.title}</p>
                      {item.companyName && <p className="mt-1 truncate text-xs text-slate-500">{item.companyName}</p>}
                    </div>
                    <time className="shrink-0 text-sm font-semibold text-slate-600" dateTime={item.date}>{item.date.slice(5)}</time>
                  </div>
                </div>
              ))}
              {upcomingItems.length === 0 && <div className="grid h-52 place-items-center rounded-2xl border border-dashed border-slate-300 px-4 text-center text-sm text-slate-500">30일 내 예정된 일정이 없습니다.</div>}
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <SectionHeading eyebrow="RECENT ACTIVITY" title="최근 지원 활동" href="/applications" linkLabel="전체 보기" />
            <div className="mt-6 divide-y divide-slate-100">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-blue-600">{activity.companyName}</p>
                    <Link href={`/jobs/${activity.jobPostingId}`} className="mt-1 block truncate font-bold hover:text-blue-700">{activity.jobTitle}</Link>
                    <p className="mt-1 text-sm text-slate-500">{activity.previousStatus ? `${applicationStatusLabels[activity.previousStatus]} → ` : ""}{applicationStatusLabels[activity.newStatus]}</p>
                  </div>
                  <time className="shrink-0 text-xs text-slate-400" dateTime={activity.occurredAt}>{formatActivityTime(activity.occurredAt)}</time>
                </div>
              ))}
              {activities.length === 0 && <p className="py-12 text-center text-sm text-slate-500">아직 지원 활동이 없습니다.</p>}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <SectionHeading eyebrow="RECENT JOBS" title="최근 저장한 공고" href="/jobs" linkLabel="전체 보기" />
            <div className="mt-6 divide-y divide-slate-100">
              {jobs.slice(0, 5).map((job) => (
                <article key={job.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-blue-600">{job.companyName}</p>
                    <Link href={`/jobs/${job.id}`} className="mt-1 block truncate font-bold hover:text-blue-700">{job.title}</Link>
                    <p className="mt-1 truncate text-sm text-slate-500">{[job.position, job.employmentType ? employmentTypeLabels[job.employmentType] : null, job.recruitmentType ? recruitmentTypeLabels[job.recruitmentType] : null, job.location].filter(Boolean).join(" · ") || "상세 조건 미입력"}</p>
                  </div>
                  <p className="shrink-0 text-xs text-slate-400">{job.deadline ? `${job.deadline.slice(5)} 마감` : "상시 채용"}</p>
                </article>
              ))}
              {jobs.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-sm text-slate-500">아직 저장한 공고가 없습니다.</p>
                  <Link href="/jobs/new" className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">공고 등록하기</Link>
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

function SectionHeading({ eyebrow, title, href, linkLabel }: { eyebrow: string; title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-blue-600">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold">{title}</h2>
      </div>
      <Link href={href} className="text-sm font-semibold text-blue-600">{linkLabel}</Link>
    </div>
  );
}
