import { apiUrl } from "@/lib/api";

export const skillCategoryLabels = {
  BACKEND: "Backend",
  FRONTEND: "Frontend",
  DATABASE: "Database",
  INFRASTRUCTURE: "Infrastructure",
} as const;

export type SkillCategory = keyof typeof skillCategoryLabels;

export type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
};

export async function fetchSkills(signal?: AbortSignal) {
  return fetch(`${apiUrl}/api/skills`, {
    credentials: "include",
    signal,
  });
}
