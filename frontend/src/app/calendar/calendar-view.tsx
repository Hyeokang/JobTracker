"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AppHeader } from "@/components/app-header";
import { PageLoadError, PageLoading } from "@/components/auth-state";
import { useCurrentUser } from "@/hooks/use-current-user";
import { fetchApplications, type Application } from "@/lib/applications";
import {
  calendarItemTypeLabels,
  createCalendarEvent,
  deleteCalendarEvent,
  fetchCalendarItems,
  updateCalendarEvent,
  type CalendarEventPayload,
  type CalendarItem,
  type EditableCalendarEventType,
} from "@/lib/calendar";

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
const editableTypes: EditableCalendarEventType[] = ["CODING_TEST", "INTERVIEW", "RESULT", "PERSONAL"];
const typeStyles = {
  DEADLINE: "bg-rose-100 text-rose-700",
  CODING_TEST: "bg-amber-100 text-amber-800",
  INTERVIEW: "bg-blue-100 text-blue-700",
  RESULT: "bg-emerald-100 text-emerald-700",
  PERSONAL: "bg-violet-100 text-violet-700",
} as const;

type EventForm = {
  title: string;
  type: EditableCalendarEventType;
  date: string;
  time: string;
  applicationId: string;
  notes: string;
};

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function emptyForm(date: string): EventForm {
  return { title: "", type: "INTERVIEW", date, time: "", applicationId: "", notes: "" };
}

function itemToForm(item: CalendarItem): EventForm {
  return {
    title: item.title,
    type: item.type as EditableCalendarEventType,
    date: item.date,
    time: item.time?.slice(0, 5) ?? "",
    applicationId: item.applicationId ?? "",
    notes: item.notes ?? "",
  };
}

export function CalendarView() {
  const router = useRouter();
  const { user, isLoading: isUserLoading, hasError: hasUserError } = useCurrentUser();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [editingItem, setEditingItem] = useState<CalendarItem | null>(null);
  const [form, setForm] = useState<EventForm>(() => emptyForm(dateKey(new Date())));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const rangeStart = dateKey(calendarDays[0]);
  const rangeEnd = dateKey(calendarDays[calendarDays.length - 1]);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      fetchCalendarItems(rangeStart, rangeEnd, controller.signal),
      fetchApplications(controller.signal),
    ])
      .then(async ([calendarResponse, applicationsResponse]) => {
        if (calendarResponse.status === 401 || applicationsResponse.status === 401) {
          router.replace("/login");
          return;
        }
        if (!calendarResponse.ok || !applicationsResponse.ok) {
          throw new Error("Failed to load calendar");
        }
        setItems((await calendarResponse.json()) as CalendarItem[]);
        setApplications((await applicationsResponse.json()) as Application[]);
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setHasError(true);
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [rangeStart, rangeEnd, reloadKey, router]);

  const itemsByDate = useMemo(() => {
    return items.reduce<Record<string, CalendarItem[]>>((grouped, item) => {
      (grouped[item.date] ??= []).push(item);
      return grouped;
    }, {});
  }, [items]);

  function moveMonth(offset: number) {
    setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
    setIsFormOpen(false);
  }

  function moveToToday() {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(dateKey(today));
  }

  function openCreateForm(date = selectedDate) {
    setSelectedDate(date);
    setEditingItem(null);
    setForm(emptyForm(date));
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(item: CalendarItem) {
    if (!item.editable) return;
    setSelectedDate(item.date);
    setEditingItem(item);
    setForm(itemToForm(item));
    setFormError(null);
    setIsFormOpen(true);
  }

  async function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);

    const payload: CalendarEventPayload = {
      title: form.title.trim(),
      type: form.type,
      date: form.date,
      time: form.time || null,
      applicationId: form.applicationId || null,
      notes: form.notes.trim() || null,
    };

    try {
      const response = editingItem
        ? await updateCalendarEvent(editingItem.id, payload)
        : await createCalendarEvent(payload);
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error("Failed to save event");
      setSelectedDate(form.date);
      setIsFormOpen(false);
      setReloadKey((key) => key + 1);
    } catch {
      setFormError("일정을 저장하지 못했습니다. 입력 내용을 확인하고 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeEvent() {
    if (!editingItem || !window.confirm("이 일정을 삭제할까요?")) return;
    setIsSaving(true);
    setFormError(null);

    try {
      const response = await deleteCalendarEvent(editingItem.id);
      if (!response.ok) throw new Error("Failed to delete event");
      setIsFormOpen(false);
      setReloadKey((key) => key + 1);
    } catch {
      setFormError("일정을 삭제하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  if (hasUserError || hasError) return <PageLoadError />;
  if (isUserLoading || (isLoading && items.length === 0) || !user) return <PageLoading />;

  const selectedItems = itemsByDate[selectedDate] ?? [];
  const todayKey = dateKey(new Date());

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AppHeader user={user} />
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">Schedule</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">취업 일정</h1>
            <p className="mt-3 text-slate-600">공고 마감일과 전형 일정을 한곳에서 확인하세요.</p>
          </div>
          <button type="button" onClick={() => openCreateForm()} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700">
            일정 등록
          </button>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" aria-label="월간 일정">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => moveMonth(-1)} aria-label="이전 달" className="grid size-10 place-items-center rounded-xl border border-slate-200 text-xl hover:bg-slate-50">‹</button>
                <button type="button" onClick={() => moveMonth(1)} aria-label="다음 달" className="grid size-10 place-items-center rounded-xl border border-slate-200 text-xl hover:bg-slate-50">›</button>
                <button type="button" onClick={moveToToday} className="ml-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">오늘</button>
              </div>
              <h2 className="text-xl font-bold sm:text-2xl">{currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월</h2>
            </header>

            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-500">
                  {weekDays.map((day, index) => (
                    <div key={day} className={`py-3 ${index === 0 ? "text-rose-500" : index === 6 ? "text-blue-500" : ""}`}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {calendarDays.map((day) => {
                    const key = dateKey(day);
                    const dayItems = itemsByDate[key] ?? [];
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    const isSelected = key === selectedDate;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSelectedDate(key);
                          setIsFormOpen(false);
                        }}
                        onDoubleClick={() => openCreateForm(key)}
                        className={`min-h-32 border-r border-b border-slate-100 p-2 text-left align-top transition hover:bg-blue-50/50 ${!isCurrentMonth ? "bg-slate-50/70 text-slate-400" : ""} ${isSelected ? "ring-2 ring-inset ring-blue-500" : ""}`}
                      >
                        <span className={`inline-grid size-7 place-items-center rounded-full text-sm font-semibold ${key === todayKey ? "bg-blue-600 text-white" : ""}`}>{day.getDate()}</span>
                        <span className="mt-1 block space-y-1">
                          {dayItems.slice(0, 3).map((item) => (
                            <span key={`${item.type}-${item.id}`} className={`block truncate rounded px-1.5 py-1 text-xs font-semibold ${typeStyles[item.type]}`}>
                              {item.time ? `${item.time.slice(0, 5)} ` : ""}{item.title}
                            </span>
                          ))}
                          {dayItems.length > 3 && <span className="block px-1 text-[10px] font-semibold text-slate-500">+{dayItems.length - 3}개</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            {isFormOpen ? (
              <form onSubmit={saveEvent} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-bold">{editingItem ? "일정 수정" : "일정 등록"}</h2>
                  <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100" aria-label="폼 닫기">✕</button>
                </div>
                <div>
                  <label htmlFor="event-title" className="mb-1.5 block text-sm font-semibold">일정명</label>
                  <input id="event-title" required maxLength={200} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="event-type" className="mb-1.5 block text-sm font-semibold">구분</label>
                    <select id="event-type" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as EditableCalendarEventType })} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 outline-none focus:border-blue-500">
                      {editableTypes.map((type) => <option key={type} value={type}>{calendarItemTypeLabels[type]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="event-time" className="mb-1.5 block text-sm font-semibold">시간</label>
                    <input id="event-time" type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label htmlFor="event-date" className="mb-1.5 block text-sm font-semibold">날짜</label>
                  <input id="event-date" type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="event-application" className="mb-1.5 block text-sm font-semibold">연결된 지원</label>
                  <select id="event-application" value={form.applicationId} onChange={(event) => setForm({ ...form, applicationId: event.target.value })} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 outline-none focus:border-blue-500">
                    <option value="">연결하지 않음</option>
                    {applications.map((application) => <option key={application.id} value={application.id}>{application.companyName} · {application.jobTitle}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="event-notes" className="mb-1.5 block text-sm font-semibold">메모</label>
                  <textarea id="event-notes" rows={3} maxLength={1000} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                </div>
                {formError && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={isSaving} className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60">{isSaving ? "저장 중..." : "저장"}</button>
                  {editingItem && <button type="button" onClick={removeEvent} disabled={isSaving} className="rounded-xl border border-rose-200 px-4 py-3 font-semibold text-rose-600 disabled:opacity-60">삭제</button>}
                </div>
              </form>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-wider text-blue-600 uppercase">Selected date</p>
                    <h2 className="mt-1 text-xl font-bold">{selectedDate}</h2>
                  </div>
                  <button type="button" onClick={() => openCreateForm()} className="rounded-xl border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">+ 추가</button>
                </div>
                <div className="mt-5 space-y-3">
                  {selectedItems.map((item) => (
                    <article key={`${item.type}-${item.id}`} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${typeStyles[item.type]}`}>{calendarItemTypeLabels[item.type]}</span>
                        {item.time && <time className="text-sm font-semibold text-slate-500">{item.time.slice(0, 5)}</time>}
                      </div>
                      <h3 className="mt-3 font-bold">{item.title}</h3>
                      {item.companyName && <p className="mt-1 text-sm text-slate-500">{item.companyName}</p>}
                      {item.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{item.notes}</p>}
                      <div className="mt-3 flex gap-3 text-sm font-semibold">
                        {item.jobPostingId && <Link href={`/jobs/${item.jobPostingId}`} className="text-blue-600 hover:text-blue-700">공고 보기</Link>}
                        {item.editable && <button type="button" onClick={() => openEditForm(item)} className="text-slate-600 hover:text-slate-950">수정</button>}
                      </div>
                    </article>
                  ))}
                  {selectedItems.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">등록된 일정이 없습니다.</div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
