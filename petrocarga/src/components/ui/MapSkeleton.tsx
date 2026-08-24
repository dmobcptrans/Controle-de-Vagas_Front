export default function MapSkeleton() {
  return (
    <div className="mb-4 h-[calc(75vh-120px)] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md md:h-[70vh] lg:h-[75vh]">
      <div className="relative h-full w-full animate-pulse overflow-hidden bg-[#eef7f1]">
        {/* Blocos suaves */}
        <div className="absolute left-[8%] top-[10%] h-28 w-36 rounded-2xl bg-white/70" />
        <div className="absolute right-[10%] top-[14%] h-24 w-48 rounded-2xl bg-slate-100/80" />

        <div className="absolute left-[20%] top-[42%] h-40 w-52 rounded-3xl bg-white/60" />
        <div className="absolute right-[15%] top-[50%] h-32 w-36 rounded-2xl bg-slate-100/80" />

        <div className="absolute left-[12%] bottom-[8%] h-24 w-44 rounded-2xl bg-slate-100/70" />
        <div className="absolute right-[25%] bottom-[12%] h-20 w-28 rounded-2xl bg-white/70" />

        {/* Pontos decorativos */}
        <div className="absolute left-[28%] top-[30%] h-3 w-3 rounded-full bg-slate-300" />
        <div className="absolute left-[62%] top-[40%] h-3 w-3 rounded-full bg-slate-300" />
        <div className="absolute left-[45%] top-[68%] h-3 w-3 rounded-full bg-slate-300" />

        {/* Shimmer */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
    </div>
  );
}