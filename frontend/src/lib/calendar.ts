import { csrfFetch } from "@/lib/api";

export const calendarItemTypeLabels = {
  DEADLINE: "공고 마감",
  CODING_TEST: "코딩테스트",
  INTERVIEW: "면접",
  RESULT: "결과 발표",
  PERSONAL: "개인 일정",
} as const;

export type CalendarItemType = keyof typeof calendarItemTypeLabels;
export type EditableCalendarEventType = Exclude<CalendarItemType, "DEADLINE">;

export type CalendarItem = {
  id: string;
  type: CalendarItemType;
  title: string;
  date: string;
  time: string | null;
  notes: string | null;
  jobPostingId: string | null;
  applicationId: string | null;
  companyName: string | null;
  editable: boolean;
};

export type CalendarEventPayload = {
  title: string;
  type: EditableCalendarEventType;
  date: string;
  time: string | null;
  applicationId: string | null;
  notes: string | null;
};

export function fetchCalendarItems(start: string, end: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ start, end });
  return fetch(`/api/calendar?${params}`, { credentials: "include", signal });
}

export function createCalendarEvent(payload: CalendarEventPayload) {
  return csrfFetch("/api/calendar/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateCalendarEvent(eventId: string, payload: CalendarEventPayload) {
  return csrfFetch(`/api/calendar/events/${eventId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteCalendarEvent(eventId: string) {
  return csrfFetch(`/api/calendar/events/${eventId}`, { method: "DELETE" });
}
