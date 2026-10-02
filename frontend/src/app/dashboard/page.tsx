import type { Metadata } from "next";
import { Dashboard } from "./dashboard";

export const metadata: Metadata = {
  title: "대시보드 | JobTracker",
  description: "나의 채용공고와 지원 현황을 확인하세요.",
};

export default function DashboardPage() {
  return <Dashboard />;
}
