import type { Metadata } from "next";
import { CalendarView } from "./calendar-view";

export const metadata: Metadata = {
  title: "일정 | JobTracker",
  description: "채용공고 마감일과 취업 준비 일정을 관리하세요.",
};

export default function CalendarPage() {
  return <CalendarView />;
}
