export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="mb-4 text-sm font-semibold tracking-widest text-blue-600 uppercase">
          JobTracker
        </p>
        <h1 className="max-w-2xl text-4xl leading-tight font-bold tracking-tight text-slate-950 sm:text-5xl">
          채용공고부터 지원 과정까지 한곳에서 관리하세요.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          채용공고를 구조화하고, 지원 현황과 일정을 관리하며, 쌓인 데이터를
          바탕으로 필요한 기술을 확인하는 서비스입니다.
        </p>
        <div
          className="mt-10 rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-600"
          role="status"
        >
          프로젝트 초기 설정을 진행하고 있습니다.
        </div>
      </section>
    </main>
  );
}
