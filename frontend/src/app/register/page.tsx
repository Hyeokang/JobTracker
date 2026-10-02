import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "회원가입 | JobTracker",
  description: "JobTracker 계정을 만들고 취업 준비 기록을 시작하세요.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] px-6 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-10 flex items-center justify-center gap-3" aria-label="홈으로 이동">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-lg font-bold text-white">
            J
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-950">JobTracker</span>
        </Link>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_25px_70px_-35px_rgba(15,23,42,0.3)] sm:p-9">
          <div className="mb-8">
            <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">Create account</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">취업 준비를 시작하세요</h1>
            <p className="mt-3 leading-7 text-slate-600">
              계정을 만들고 채용공고와 지원 과정을 한곳에서 관리하세요.
            </p>
          </div>
          <RegisterForm />
        </section>
      </div>
    </main>
  );
}
