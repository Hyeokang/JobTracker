"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";

const registerSchema = z
  .object({
    displayName: z.string().trim().min(2, "이름은 2자 이상 입력해 주세요.").max(50),
    email: z.string().trim().email("올바른 이메일을 입력해 주세요.").max(255),
    password: z.string().min(8, "비밀번호는 8자 이상 입력해 주세요.").max(72),
    passwordConfirm: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

type ApiError = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function RegisterForm() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerMessage(null);

    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: values.displayName,
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as ApiError;
        const knownFields: Array<keyof RegisterFormValues> = [
          "displayName",
          "email",
          "password",
        ];

        knownFields.forEach((field) => {
          const message = error.fieldErrors?.[field];
          if (message) {
            setError(field, { message });
          }
        });
        setServerMessage(error.message ?? "회원가입을 완료하지 못했습니다.");
        return;
      }

      setRegisteredEmail(values.email.trim().toLowerCase());
    } catch {
      setServerMessage("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    }
  });

  if (registeredEmail) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-600 text-xl text-white">
          ✓
        </span>
        <h2 className="mt-5 text-2xl font-bold text-slate-950">가입이 완료되었습니다</h2>
        <p className="mt-3 text-slate-600">
          <strong className="font-semibold text-slate-800">{registeredEmail}</strong> 계정이
          생성되었습니다.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field
        id="displayName"
        label="이름"
        placeholder="홍길동"
        autoComplete="name"
        error={errors.displayName?.message}
        registration={register("displayName")}
      />
      <Field
        id="email"
        label="이메일"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        registration={register("email")}
      />
      <Field
        id="password"
        label="비밀번호"
        type="password"
        placeholder="8자 이상 입력"
        autoComplete="new-password"
        error={errors.password?.message}
        registration={register("password")}
      />
      <Field
        id="passwordConfirm"
        label="비밀번호 확인"
        type="password"
        placeholder="비밀번호 다시 입력"
        autoComplete="new-password"
        error={errors.passwordConfirm?.message}
        registration={register("passwordConfirm")}
      />

      {serverMessage && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "계정을 만들고 있습니다..." : "계정 만들기"}
      </button>
    </form>
  );
}

type FieldProps = {
  id: keyof RegisterFormValues;
  label: string;
  type?: "text" | "email" | "password";
  placeholder: string;
  autoComplete: string;
  error?: string;
  registration: UseFormRegisterReturn;
};

function Field({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  error,
  registration,
}: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 aria-invalid:border-red-400 aria-invalid:focus:ring-red-100"
        {...registration}
      />
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
