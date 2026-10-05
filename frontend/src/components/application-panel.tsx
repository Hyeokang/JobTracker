"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  applicationStatusLabels,
  changeApplicationStatus,
  createApplication,
  fetchApplicationEvents,
  fetchApplications,
  type Application,
  type ApplicationEvent,
  type ApplicationStatus,
} from "@/lib/applications";

export function ApplicationPanel({ jobPostingId }: { jobPostingId: string }) {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [events, setEvents] = useState<ApplicationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadApplication() {
      try {
        const response = await fetchApplications(controller.signal);
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        if (!response.ok) throw new Error("Failed to load applications");

        const applications = (await response.json()) as Application[];
        const current = applications.find((item) => item.jobPostingId === jobPostingId) ?? null;
        setApplication(current);
        if (current) await loadEvents(current.id, controller.signal);
      } catch (loadError) {
        if (!(loadError instanceof DOMException && loadError.name === "AbortError")) {
          setError("지원 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    async function loadEvents(applicationId: string, signal?: AbortSignal) {
      const response = await fetchApplicationEvents(applicationId, signal);
      if (!response.ok) throw new Error("Failed to load application events");
      setEvents((await response.json()) as ApplicationEvent[]);
    }

    loadApplication();
    return () => controller.abort();
  }, [jobPostingId, router]);

  async function startTracking() {
    setIsSaving(true);
    setError(null);
    try {
      const response = await createApplication(jobPostingId);
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error("Failed to create application");

      const created = (await response.json()) as Application;
      setApplication(created);
      const eventsResponse = await fetchApplicationEvents(created.id);
      if (eventsResponse.ok) setEvents((await eventsResponse.json()) as ApplicationEvent[]);
    } catch {
      setError("지원 관리를 시작하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateStatus(status: ApplicationStatus) {
    if (!application || status === application.status) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await changeApplicationStatus(application.id, status);
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error("Failed to update application status");

      setApplication((await response.json()) as Application);
      const eventsResponse = await fetchApplicationEvents(application.id);
      if (eventsResponse.ok) setEvents((await eventsResponse.json()) as ApplicationEvent[]);
    } catch {
      setError("지원 상태를 변경하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/70 p-7 sm:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">Application</p>
          <h2 className="mt-2 text-xl font-bold">지원 진행 관리</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">상태를 변경하면 이전 단계와 변경 시점이 자동으로 기록됩니다.</p>
        </div>

        {!isLoading && !application && (
          <button type="button" onClick={startTracking} disabled={isSaving} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 disabled:opacity-60">
            {isSaving ? "등록 중..." : "지원 관리 시작"}
          </button>
        )}
      </div>

      {isLoading && <p className="mt-5 text-sm text-slate-500">지원 정보를 불러오는 중...</p>}
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {application && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="rounded-2xl border border-blue-100 bg-white p-5">
            <label htmlFor="application-status" className="text-sm font-semibold text-slate-700">현재 지원 상태</label>
            <select
              id="application-status"
              value={application.status}
              onChange={(event) => updateStatus(event.target.value as ApplicationStatus)}
              disabled={isSaving}
              className="mt-3 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
            >
              {Object.entries(applicationStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <p className="mt-3 text-xs text-slate-500">마지막 변경: {formatDateTime(application.updatedAt)}</p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-700">상태 변경 이력</h3>
            <ol className="mt-4 space-y-4">
              {events.map((event) => (
                <li key={event.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-600" />
                  <div>
                    <p className="font-semibold text-slate-800">
                      {event.previousStatus ? `${applicationStatusLabels[event.previousStatus]} → ` : ""}
                      {applicationStatusLabels[event.newStatus]}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(event.occurredAt)}</p>
                    {event.note && <p className="mt-2 text-slate-600">{event.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
