import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "로그인 | JobTracker",
  description: "JobTracker에 로그인하고 취업 준비 기록을 관리하세요.",
};

export default function LoginPage() {
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
            <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">Welcome back</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">다시 만나 반가워요</h1>
            <p className="mt-3 leading-7 text-slate-600">로그인하고 저장한 취업 준비 기록을 이어서 관리하세요.</p>
          </div>
          <LoginForm />
          <p className="mt-7 text-center text-sm text-slate-600">
            아직 계정이 없나요?{" "}
            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              회원가입
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
