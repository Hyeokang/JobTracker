import type { Metadata } from "next";
import { JobList } from "./job-list";

export const metadata: Metadata = {
  title: "채용공고 | JobTracker",
  description: "저장한 채용공고를 확인하고 관리하세요.",
};

export default function JobsPage() {
  return <JobList />;
}
