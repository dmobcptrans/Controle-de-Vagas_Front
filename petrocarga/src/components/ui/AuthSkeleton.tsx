import ReservaCTASkeleton from './CTA/ReservaCTASkeleton';
import PageHeaderSkeleton from './pageHeaderSkeleton';

export default function AuthSkeleton() {
  return (
    <div className="min-h-screen bg-[#f5f5f0] ">
      <PageHeaderSkeleton />

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        <ReservaCTASkeleton/>
      </main>
    </div>
  );
}
