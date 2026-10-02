"use client";

export function PageLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f7fb]">
      <p className="text-sm font-medium text-slate-500">내 정보를 불러오는 중...</p>
    </main>
  );
}

export function PageLoadError() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f7fb] px-6">
      <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-950">페이지를 불러오지 못했습니다</h1>
        <p className="mt-3 text-slate-600">서버 연결을 확인한 뒤 다시 시도해 주세요.</p>
        <button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white">다시 시도</button>
      </div>
    </main>
  );
}
