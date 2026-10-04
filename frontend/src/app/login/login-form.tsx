"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { csrfFetch } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().trim().email("올바른 이메일을 입력해 주세요.").max(255),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type ApiError = { message?: string };

const testAccount = {
  email: process.env.NEXT_PUBLIC_TEST_ACCOUNT_EMAIL ?? "",
  password: process.env.NEXT_PUBLIC_TEST_ACCOUNT_PASSWORD ?? "",
};

export function LoginForm() {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: testAccount,
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerMessage(null);

    try {
      const body = new URLSearchParams({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      const response = await csrfFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (!response.ok) {
        const error = (await response.json()) as ApiError;
        setServerMessage(error.message ?? "로그인하지 못했습니다.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setServerMessage("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {testAccount.email && testAccount.password && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-950">
          <p className="font-semibold">로컬 테스트 계정</p>
          <p className="mt-1 break-all">아이디: {testAccount.email}</p>
          <p className="break-all">비밀번호: {testAccount.password}</p>
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-800">이메일</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 aria-invalid:border-red-400 aria-invalid:focus:ring-red-100"
          {...register("email")}
        />
        {errors.email && <p id="email-error" className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-800">비밀번호</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호 입력"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 aria-invalid:border-red-400 aria-invalid:focus:ring-red-100"
          {...register("password")}
        />
        {errors.password && <p id="password-error" className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      {serverMessage && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "로그인하고 있습니다..." : "로그인"}
      </button>
    </form>
  );
}
