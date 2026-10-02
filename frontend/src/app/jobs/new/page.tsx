import type { Metadata } from "next";
import { NewJob } from "./new-job";

export const metadata: Metadata = {
  title: "채용공고 등록 | JobTracker",
  description: "새 채용공고를 직접 등록하세요.",
};

export default function NewJobPage() {
  return <NewJob />;
}
