import type { Metadata } from "next";
import { JobDetail } from "./job-detail";

export const metadata: Metadata = {
  title: "채용공고 상세 | JobTracker",
  description: "저장한 채용공고의 상세 정보를 확인하세요.",
};

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobDetail jobPostingId={id} />;
}
