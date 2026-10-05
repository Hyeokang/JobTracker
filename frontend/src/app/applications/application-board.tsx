"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { PageLoadError, PageLoading } from "@/components/auth-state";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  applicationStatusLabels,
  changeApplicationStatus,
  fetchApplications,
  type Application,
  type ApplicationStatus,
} from "@/lib/applications";

type BoardColumn = {
  id: string;
  label: string;
  description: string;
  statuses: ApplicationStatus[];
  dropStatus: ApplicationStatus;
};

const columns: BoardColumn[] = [
  { id: "INTERESTED", label: "관심", description: "살펴보는 공고", statuses: ["INTERESTED"], dropStatus: "INTERESTED" },
  { id: "PLANNED", label: "지원 예정", description: "지원 준비 중", statuses: ["PLANNED"], dropStatus: "PLANNED" },
  { id: "APPLIED", label: "지원 완료", description: "지원서 제출", statuses: ["APPLIED"], dropStatus: "APPLIED" },
  { id: "DOCUMENT", label: "서류", description: "서류 전형", statuses: ["DOCUMENT"], dropStatus: "DOCUMENT" },
  { id: "CODING_TEST", label: "코딩테스트", description: "과제 및 테스트", statuses: ["CODING_TEST"], dropStatus: "CODING_TEST" },
  { id: "INTERVIEW", label: "면접", description: "1·2차 면접", statuses: ["INTERVIEW_1", "INTERVIEW_2"], dropStatus: "INTERVIEW_1" },
  { id: "RESULT", label: "결과", description: "최종 전형 및 결과", statuses: ["FINAL", "ACCEPTED", "REJECTED", "WITHDRAWN"], dropStatus: "FINAL" },
];

const statuses = Object.keys(applicationStatusLabels) as ApplicationStatus[];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(new Date(value));
}

function ApplicationCard({
  application,
  isUpdating,
  onStatusChange,
}: {
  application: Application;
  isUpdating: boolean;
  onStatusChange?: (status: ApplicationStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
    disabled: isUpdating,
  });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${isDragging ? "opacity-30" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-blue-600">{application.companyName}</p>
          <h3 className="mt-1 line-clamp-2 font-bold leading-snug text-slate-950">
            <Link href={`/jobs/${application.jobPostingId}`} className="transition hover:text-blue-700">
              {application.jobTitle}
            </Link>
          </h3>
        </div>
        <button
          type="button"
          aria-label={`${application.jobTitle} 이동`}
          className="shrink-0 cursor-grab rounded-lg px-2 py-1 text-lg leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <select
          aria-label={`${application.jobTitle} 지원 상태`}
          value={application.status}
          disabled={isUpdating}
          onChange={(event) => onStatusChange?.(event.target.value as ApplicationStatus)}
          className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500 disabled:opacity-60"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>{applicationStatusLabels[status]}</option>
          ))}
        </select>
        <time className="shrink-0 text-xs text-slate-400" dateTime={application.updatedAt}>
          {isUpdating ? "저장 중..." : formatDate(application.updatedAt)}
        </time>
      </div>
    </article>
  );
}

function ApplicationCardPreview({ application }: { application: Application }) {
  return (
    <article className="w-72 rotate-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
      <p className="truncate text-xs font-bold text-blue-600">{application.companyName}</p>
      <h3 className="mt-1 line-clamp-2 font-bold leading-snug text-slate-950">{application.jobTitle}</h3>
      <span className="mt-4 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
        {applicationStatusLabels[application.status]}
      </span>
    </article>
  );
}

function KanbanColumn({
  column,
  applications,
  updatingIds,
  onStatusChange,
}: {
  column: BoardColumn;
  applications: Application[];
  updatingIds: Set<string>;
  onStatusChange: (application: Application, status: ApplicationStatus) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: column.id });

  return (
    <section
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-3xl border p-3 transition sm:w-80 ${isOver ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-100/70"}`}
      aria-label={`${column.label} 단계`}
    >
      <header className="flex items-center justify-between gap-3 px-2 py-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold">{column.label}</h2>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500">{applications.length}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{column.description}</p>
        </div>
      </header>
      <div className="mt-2 flex min-h-32 flex-1 flex-col gap-3 rounded-2xl">
        {applications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            isUpdating={updatingIds.has(application.id)}
            onStatusChange={(status) => onStatusChange(application, status)}
          />
        ))}
        {applications.length === 0 && (
          <div className="grid min-h-28 place-items-center rounded-2xl border border-dashed border-slate-300 px-4 text-center text-xs text-slate-400">
            카드를 이곳으로 이동하세요
          </div>
        )}
      </div>
    </section>
  );
}

export function ApplicationBoard() {
  const router = useRouter();
  const { user, isLoading: isUserLoading, hasError: hasUserError } = useCurrentUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isApplicationsLoading, setIsApplicationsLoading] = useState(true);
  const [hasApplicationsError, setHasApplicationsError] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchApplications(controller.signal)
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        if (!response.ok) throw new Error("Failed to load applications");
        setApplications((await response.json()) as Application[]);
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setHasApplicationsError(true);
        }
      })
      .finally(() => setIsApplicationsLoading(false));

    return () => controller.abort();
  }, [router]);

  const groupedApplications = useMemo(() => {
    return Object.fromEntries(
      columns.map((column) => [
        column.id,
        applications.filter((application) => column.statuses.includes(application.status)),
      ]),
    ) as Record<string, Application[]>;
  }, [applications]);

  async function updateStatus(application: Application, status: ApplicationStatus) {
    if (application.status === status || updatingIds.has(application.id)) return;

    const previousApplication = application;
    setApplications((current) => current.map((item) => (
      item.id === application.id ? { ...item, status, updatedAt: new Date().toISOString() } : item
    )));
    setUpdatingIds((current) => new Set(current).add(application.id));

    try {
      const response = await changeApplicationStatus(application.id, status);
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error("Failed to update application status");
      const savedApplication = (await response.json()) as Application;
      setApplications((current) => current.map((item) => (
        item.id === savedApplication.id ? savedApplication : item
      )));
    } catch {
      setApplications((current) => current.map((item) => (
        item.id === previousApplication.id ? previousApplication : item
      )));
      window.alert("지원 상태를 변경하지 못했습니다. 이전 상태로 되돌렸습니다.");
    } finally {
      setUpdatingIds((current) => {
        const next = new Set(current);
        next.delete(application.id);
        return next;
      });
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    if (!event.over) return;

    const application = applications.find((item) => item.id === event.active.id);
    const targetColumn = columns.find((column) => column.id === event.over?.id);
    if (!application || !targetColumn || targetColumn.statuses.includes(application.status)) return;

    void updateStatus(application, targetColumn.dropStatus);
  }

  if (hasUserError || hasApplicationsError) return <PageLoadError />;
  if (isUserLoading || isApplicationsLoading || !user) return <PageLoading />;

  const activeApplication = applications.find((application) => application.id === activeId);

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AppHeader user={user} />
      <div className="mx-auto max-w-[1600px] px-6 py-10 lg:px-10 lg:py-14">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">Application board</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">지원 현황</h1>
            <p className="mt-3 text-slate-600">카드를 드래그하거나 상태를 직접 선택해 지원 과정을 관리하세요.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
            전체 지원 <strong className="ml-2 text-lg text-slate-950">{applications.length}</strong>
          </div>
        </div>

        {applications.length === 0 ? (
          <section className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="text-xl font-bold">아직 관리 중인 지원이 없습니다</h2>
            <p className="mt-3 text-slate-600">채용공고 상세 화면에서 지원 관리를 시작해 보세요.</p>
            <Link href="/jobs" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">채용공고 보기</Link>
          </section>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragCancel={() => setActiveId(null)}
            onDragEnd={handleDragEnd}
          >
            <div className="mt-10 overflow-x-auto pb-5">
              <div className="flex min-h-[520px] w-max gap-4">
                {columns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    applications={groupedApplications[column.id]}
                    updatingIds={updatingIds}
                    onStatusChange={(application, status) => void updateStatus(application, status)}
                  />
                ))}
              </div>
            </div>
            <DragOverlay>
              {activeApplication ? (
                <ApplicationCardPreview application={activeApplication} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </main>
  );
}
