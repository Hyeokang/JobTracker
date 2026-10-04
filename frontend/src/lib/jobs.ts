import { apiUrl, csrfFetch } from "@/lib/api";
import type { Skill } from "@/lib/skills";

export const employmentTypeLabels = {
  FULL_TIME: "정규직",
  CONTRACT: "계약직",
  INTERN: "인턴",
  FREELANCE: "프리랜서",
  OTHER: "기타",
} as const;

export type EmploymentType = keyof typeof employmentTypeLabels;

export const recruitmentTypeLabels = {
  ALWAYS_OPEN: "상시채용",
  ROLLING: "수시채용",
  OPEN_RECRUITMENT: "공개채용",
  OTHER: "기타",
} as const;

export type RecruitmentType = keyof typeof recruitmentTypeLabels;

export type JobPosting = {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  position: string | null;
  careerRequirement: string | null;
  employmentType: EmploymentType | null;
  recruitmentType: RecruitmentType | null;
  location: string | null;
  startedDate: string | null;
  deadline: string | null;
  requirements: string | null;
  preferredQualifications: string | null;
  originalUrl: string | null;
  skills: Skill[];
  createdAt: string;
};

export type JobPayload = Record<string, string | string[] | null>;

export async function fetchJobs(signal?: AbortSignal) {
  return fetch(`${apiUrl}/api/jobs`, {
    credentials: "include",
    signal,
  });
}

export async function fetchJob(jobPostingId: string, signal?: AbortSignal) {
  return fetch(`${apiUrl}/api/jobs/${jobPostingId}`, {
    credentials: "include",
    signal,
  });
}

export async function createJob(input: JobPayload) {
  return csrfFetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateJob(jobPostingId: string, input: JobPayload) {
  return csrfFetch(`/api/jobs/${jobPostingId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function deleteJob(jobPostingId: string) {
  return csrfFetch(`/api/jobs/${jobPostingId}`, { method: "DELETE" });
}
