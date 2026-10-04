import type { Metadata } from "next";
import { EditJob } from "./edit-job";

export const metadata: Metadata = {
  title: "채용공고 수정 | JobTracker",
  description: "저장한 채용공고 정보를 수정하세요.",
};

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditJob jobPostingId={id} />;
}
