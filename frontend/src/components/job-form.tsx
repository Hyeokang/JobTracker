"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import {
  createJob,
  employmentTypeLabels,
  recruitmentTypeLabels,
  updateJob,
  type JobPosting,
} from "@/lib/jobs";
import {
  fetchSkills,
  skillCategoryLabels,
  type Skill,
  type SkillCategory,
} from "@/lib/skills";

const jobSchema = z
  .object({
    companyName: z.string().trim().min(1, "회사명을 입력해 주세요.").max(100),
    title: z.string().trim().min(1, "공고 제목을 입력해 주세요.").max(200),
    position: z.string().trim().max(100),
    careerRequirement: z.string().trim().max(100),
    employmentType: z.enum(["", "FULL_TIME", "CONTRACT", "INTERN", "FREELANCE", "OTHER"]),
    recruitmentType: z.enum(["", "ALWAYS_OPEN", "ROLLING", "OPEN_RECRUITMENT", "OTHER"]),
    location: z.string().trim().max(100),
    startedDate: z.string(),
    deadline: z.string(),
    originalUrl: z.union([z.literal(""), z.string().url("올바른 URL을 입력해 주세요.")]),
    requirements: z.string().trim().max(5000),
    preferredQualifications: z.string().trim().max(5000),
    skillIds: z.array(z.string().uuid()),
  })
  .refine(
    (values) => !values.startedDate || !values.deadline || values.deadline >= values.startedDate,
    { message: "마감일은 모집 시작일보다 빠를 수 없습니다.", path: ["deadline"] },
  );

type JobFormValues = z.infer<typeof jobSchema>;
type ApiError = { message?: string; fieldErrors?: Record<string, string> };

const emptyValues: JobFormValues = {
  companyName: "",
  title: "",
  position: "",
  careerRequirement: "",
  employmentType: "",
  recruitmentType: "",
  location: "",
  startedDate: "",
  deadline: "",
  originalUrl: "",
  requirements: "",
  preferredQualifications: "",
  skillIds: [],
};

function valuesFromJob(job: JobPosting): JobFormValues {
  return {
    companyName: job.companyName,
    title: job.title,
    position: job.position ?? "",
    careerRequirement: job.careerRequirement ?? "",
    employmentType: job.employmentType ?? "",
    recruitmentType: job.recruitmentType ?? "",
    location: job.location ?? "",
    startedDate: job.startedDate ?? "",
    deadline: job.deadline ?? "",
    originalUrl: job.originalUrl ?? "",
    requirements: job.requirements ?? "",
    preferredQualifications: job.preferredQualifications ?? "",
    skillIds: job.skills.map((skill) => skill.id),
  };
}

export function JobForm({ job }: { job?: JobPosting }) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [areSkillsLoading, setAreSkillsLoading] = useState(true);
  const [hasSkillsError, setHasSkillsError] = useState(false);
  const defaultValues = job ? valuesFromJob(job) : emptyValues;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<JobFormValues>({ resolver: zodResolver(jobSchema), defaultValues });

  useEffect(() => {
    const controller = new AbortController();

    fetchSkills(controller.signal)
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        if (!response.ok) throw new Error("Failed to load skills");
        setSkills((await response.json()) as Skill[]);
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setHasSkillsError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAreSkillsLoading(false);
      });

    return () => controller.abort();
  }, [router]);

  const cancelHref = job ? `/jobs/${job.id}` : "/jobs";
  const onSubmit = handleSubmit(async (values) => {
    setServerMessage(null);

    try {
      const payload = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, value || null]),
      );
      const response = job ? await updateJob(job.id, payload) : await createJob(payload);

      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) {
        const error = (await response.json()) as ApiError;
        Object.entries(error.fieldErrors ?? {}).forEach(([field, message]) => {
          if (field in emptyValues) setError(field as keyof JobFormValues, { message });
        });
        setServerMessage(error.message ?? "채용공고를 저장하지 못했습니다.");
        return;
      }

      const savedJob = (await response.json()) as JobPosting;
      router.push(`/jobs/${savedJob.id}`);
    } catch {
      setServerMessage("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    }
  });

  return (
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
          <div>
            <label htmlFor="recruitmentType" className="mb-2 block text-sm font-semibold text-slate-800">채용 방식</label>
            <select id="recruitmentType" className={inputClassName} {...register("recruitmentType")}>
              <option value="">선택하지 않음</option>
              {Object.entries(recruitmentTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <Field id="location" label="근무 지역" placeholder="예: 서울 강남구" error={errors.location?.message} registration={register("location")} />
        </div>
      </section>

      <section className="border-t border-slate-100 pt-8">
        <h2 className="text-lg font-bold">기술스택</h2>
        <p className="mt-2 text-sm text-slate-500">공고에서 요구하는 기술을 모두 선택하세요.</p>
        {areSkillsLoading ? (
          <p className="mt-5 text-sm text-slate-500">기술 목록을 불러오는 중...</p>
        ) : hasSkillsError ? (
          <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">기술 목록을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.</p>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {(Object.keys(skillCategoryLabels) as SkillCategory[]).map((category) => (
              <fieldset key={category} className="rounded-2xl border border-slate-200 p-4">
                <legend className="px-1 text-sm font-bold text-slate-800">{skillCategoryLabels[category]}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.filter((skill) => skill.category === category).map((skill) => (
                    <label key={skill.id} className="cursor-pointer">
                      <input type="checkbox" value={skill.id} className="peer sr-only" {...register("skillIds")} />
                      <span className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-blue-100">
                        {skill.name}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        )}
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
        <Link href={cancelHref} className="inline-flex justify-center rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700">취소</Link>
        <button type="submit" disabled={isSubmitting || areSkillsLoading || hasSkillsError} className="inline-flex justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "저장하고 있습니다..." : job ? "수정 내용 저장" : "채용공고 저장"}
        </button>
      </div>
    </form>
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
