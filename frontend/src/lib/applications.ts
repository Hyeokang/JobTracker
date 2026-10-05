import { csrfFetch } from "@/lib/api";

export const applicationStatusLabels = {
  INTERESTED: "관심",
  PLANNED: "지원 예정",
  APPLIED: "지원 완료",
  DOCUMENT: "서류",
  CODING_TEST: "코딩테스트",
  INTERVIEW_1: "1차 면접",
  INTERVIEW_2: "2차 면접",
  FINAL: "최종 전형",
  ACCEPTED: "합격",
  REJECTED: "불합격",
  WITHDRAWN: "지원 철회",
} as const;

export type ApplicationStatus = keyof typeof applicationStatusLabels;

export type Application = {
  id: string;
  jobPostingId: string;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationEvent = {
  id: string;
  previousStatus: ApplicationStatus | null;
  newStatus: ApplicationStatus;
  note: string | null;
  occurredAt: string;
};

export function fetchApplications(signal?: AbortSignal) {
  return fetch("/api/applications", { credentials: "include", signal });
}

export function createApplication(jobPostingId: string) {
  return csrfFetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobPostingId }),
  });
}

export function changeApplicationStatus(applicationId: string, status: ApplicationStatus) {
  return csrfFetch(`/api/applications/${applicationId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export function fetchApplicationEvents(applicationId: string, signal?: AbortSignal) {
  return fetch(`/api/applications/${applicationId}/events`, {
    credentials: "include",
    signal,
  });
}
