"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import { AppHeader } from "@/components/app-header";
import { PageLoadError, PageLoading } from "@/components/auth-state";
import { useCurrentUser } from "@/hooks/use-current-user";
import { createJob, employmentTypeLabels } from "@/lib/jobs";

const jobSchema = z
  .object({
    companyName: z.string().trim().min(1, "회사명을 입력해 주세요.").max(100),
    title: z.string().trim().min(1, "공고 제목을 입력해 주세요.").max(200),
    position: z.string().trim().max(100),
    careerRequirement: z.string().trim().max(100),
    employmentType: z.enum(["", "FULL_TIME", "CONTRACT", "INTERN", "FREELANCE", "OTHER"]),
    location: z.string().trim().max(100),
    startedDate: z.string(),
    deadline: z.string(),
    originalUrl: z.union([z.literal(""), z.string().url("올바른 URL을 입력해 주세요.")]),
    requirements: z.string().trim().max(5000),
    preferredQualifications: z.string().trim().max(5000),
  })
  .refine(
    (values) => !values.startedDate || !values.deadline || values.deadline >= values.startedDate,
    { message: "마감일은 모집 시작일보다 빠를 수 없습니다.", path: ["deadline"] },
  );

type JobFormValues = z.infer<typeof jobSchema>;
type ApiError = { message?: string; fieldErrors?: Record<string, string> };

const defaultValues: JobFormValues = {
  companyName: "",
  title: "",
  position: "",
  careerRequirement: "",
  employmentType: "",
  location: "",
  startedDate: "",
  deadline: "",
  originalUrl: "",
  requirements: "",
  preferredQualifications: "",
};

export function NewJob() {
  const router = useRouter();
  const { user, isLoading, hasError } = useCurrentUser();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<JobFormValues>({ resolver: zodResolver(jobSchema), defaultValues });

  const onSubmit = handleSubmit(async (values) => {
    setServerMessage(null);

    try {
      const response = await createJob(
        Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value || null])),
      );

      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) {
        const error = (await response.json()) as ApiError;
        Object.entries(error.fieldErrors ?? {}).forEach(([field, message]) => {
          if (field in defaultValues) setError(field as keyof JobFormValues, { message });
        });
        setServerMessage(error.message ?? "채용공고를 저장하지 못했습니다.");
        return;
      }

      router.push("/jobs");
    } catch {
      setServerMessage("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    }
  });

  if (hasError) return <PageLoadError />;
  if (isLoading || !user) return <PageLoading />;

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <AppHeader user={user} />
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
        <Link href="/jobs" className="text-sm font-semibold text-slate-500 hover:text-blue-700">← 채용공고 목록</Link>
        <div className="mt-5">
          <p className="text-sm font-bold tracking-widest text-blue-600 uppercase">New job</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">채용공고 직접 등록</h1>
          <p className="mt-3 text-slate-600">확인한 공고 정보를 입력해 저장하세요. 비어 있는 항목은 나중에 보완할 수 있습니다.</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="mt-10 space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <section>
            <h2 className="text-lg font-bold">기본 정보</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field id="companyName" label="회사명" required placeholder="예: JobTracker Labs" error={errors.companyName?.message} registration={register("companyName")} />
              <Field id="title" label="공고 제목" required placeholder="예: 백엔드 개발자" error={errors.title?.message} registration={register("title")} />
              <Field id="position" label="직무" placeholder="예: Backend Engineer" error={errors.position?.message} registration={register("position")} />
              <Field id="careerRequirement" label="경력 조건" placeholder="예: 신입 또는 3년 이하" error={errors.careerRequirement?.message} registration={register("careerRequirement")} />
              <div>
                <label htmlFor="employmentType" className="mb-2 block text-sm font-semibold text-slate-800">고용 형태</label>
                <select id="employmentType" className={inputClassName} {...register("employmentType")}>
                  <option value="">선택하지 않음</option>
                  {Object.entries(employmentTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <Field id="location" label="근무 지역" placeholder="예: 서울 강남구" error={errors.location?.message} registration={register("location")} />
            </div>
          </section>

          <section className="border-t border-slate-100 pt-8">
            <h2 className="text-lg font-bold">일정과 원문</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field id="startedDate" label="모집 시작일" type="date" error={errors.startedDate?.message} registration={register("startedDate")} />
              <Field id="deadline" label="마감일" type="date" error={errors.deadline?.message} registration={register("deadline")} />
              <div className="sm:col-span-2">
                <Field id="originalUrl" label="원본 URL" type="url" placeholder="https://example.com/jobs/123" error={errors.originalUrl?.message} registration={register("originalUrl")} />
              </div>
            </div>
          </section>

          <section className="border-t border-slate-100 pt-8">
            <h2 className="text-lg font-bold">상세 내용</h2>
            <div className="mt-5 grid gap-5">
              <TextArea id="requirements" label="자격요건" placeholder="주요 자격요건을 입력하세요." error={errors.requirements?.message} registration={register("requirements")} />
              <TextArea id="preferredQualifications" label="우대사항" placeholder="우대사항을 입력하세요." error={errors.preferredQualifications?.message} registration={register("preferredQualifications")} />
            </div>
          </section>

          {serverMessage && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverMessage}</p>}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-7 sm:flex-row sm:justify-end">
            <Link href="/jobs" className="inline-flex justify-center rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700">취소</Link>
            <button type="submit" disabled={isSubmitting} className="inline-flex justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700 disabled:opacity-60">
              {isSubmitting ? "저장하고 있습니다..." : "채용공고 저장"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const inputClassName = "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 aria-invalid:border-red-400";

type FieldProps = {
  id: keyof JobFormValues;
  label: string;
  type?: "text" | "url" | "date";
  placeholder?: string;
  required?: boolean;
  error?: string;
  registration: UseFormRegisterReturn;
};

function Field({ id, label, type = "text", placeholder, required, error, registration }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">{label}{required && <span className="ml-1 text-blue-600">*</span>}</label>
      <input id={id} type={type} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={inputClassName} {...registration} />
      {error && <p id={`${id}-error`} className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function TextArea({ id, label, placeholder, error, registration }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">{label}</label>
      <textarea id={id} rows={5} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 aria-invalid:border-red-400" {...registration} />
      {error && <p id={`${id}-error`} className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
