export default function TutorialCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 border-l-4 border-l-[#1351B4] bg-white p-4">
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-slate-200" />

        <div className="flex-1">
          <div className="h-4 w-32 rounded bg-slate-200" />

          <div className="mt-2 h-3 w-56 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}