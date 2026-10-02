import { apiUrl, csrfFetch } from "@/lib/api";

export const employmentTypeLabels = {
  FULL_TIME: "정규직",
  CONTRACT: "계약직",
  INTERN: "인턴",
  FREELANCE: "프리랜서",
  OTHER: "기타",
} as const;

export type EmploymentType = keyof typeof employmentTypeLabels;

export type JobPosting = {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  position: string | null;
  careerRequirement: string | null;
  employmentType: EmploymentType | null;
  location: string | null;
  startedDate: string | null;
  deadline: string | null;
  requirements: string | null;
  preferredQualifications: string | null;
  originalUrl: string | null;
  createdAt: string;
};

export async function fetchJobs(signal?: AbortSignal) {
  return fetch(`${apiUrl}/api/jobs`, {
    credentials: "include",
    signal,
  });
}

export async function createJob(input: Record<string, string | null>) {
  return csrfFetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
