import Link from "next/link";

const features = [
  {
    number: "01",
    title: "공고를 한곳에",
    description: "관심 있는 채용공고를 저장하고 필요한 정보를 구조화합니다.",
  },
  {
    number: "02",
    title: "지원 과정을 선명하게",
    description: "지원부터 면접, 최종 결과까지 단계별 흐름을 놓치지 않습니다.",
  },
  {
    number: "03",
    title: "데이터로 준비하기",
    description: "저장한 공고를 기준으로 자주 요구되는 기술을 확인합니다.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="JobTracker 홈">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
            J
          </span>
          <span className="text-lg font-bold tracking-tight">JobTracker</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:text-blue-700"
          >
            로그인
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:text-blue-700"
          >
            회원가입
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-14 px-6 pt-16 pb-24 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:pt-24">
        <div>
          <p className="mb-6 text-sm font-bold tracking-[0.2em] text-blue-600 uppercase">
            Your career, clearly tracked
          </p>
          <h1 className="max-w-4xl text-5xl leading-[1.08] font-bold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
            흩어진 채용공고와 지원 기록을 하나의 흐름으로.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            JobTracker는 공고 수집부터 지원 단계, 일정, 기술 분석까지 취업 준비의
            전체 과정을 연결합니다.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              무료로 시작하기
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-7 py-4 font-semibold text-slate-700 transition hover:border-slate-400"
            >
              기능 살펴보기
            </a>
          </div>
        </div>

        <div className="relative flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <p className="text-sm text-slate-500">이번 달 지원</p>
                <p className="mt-1 text-3xl font-bold">0건</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                시작 준비 완료
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-xs text-slate-400">저장한 공고</p>
                <p className="mt-3 text-3xl font-semibold">0</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-5 text-blue-950">
                <p className="text-xs text-blue-600">예정된 일정</p>
                <p className="mt-3 text-3xl font-semibold">0</p>
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-dashed border-slate-300 px-5 py-7 text-center">
              <p className="font-medium text-slate-700">첫 채용공고를 준비해 보세요</p>
              <p className="mt-1 text-sm text-slate-500">가입 후 공고 URL을 등록할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 py-16 md:grid-cols-3 lg:px-10">
          {features.map((feature) => (
            <article key={feature.number} className="rounded-2xl border border-slate-200 p-6">
              <p className="text-sm font-bold text-blue-600">{feature.number}</p>
              <h2 className="mt-8 text-xl font-bold">{feature.title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
