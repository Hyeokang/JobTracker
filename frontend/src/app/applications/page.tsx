import type { Metadata } from "next";
import { ApplicationBoard } from "./application-board";

export const metadata: Metadata = {
  title: "지원 현황 | JobTracker",
  description: "채용 지원 단계를 Kanban으로 관리하세요.",
};

export default function ApplicationsPage() {
  return <ApplicationBoard />;
}
