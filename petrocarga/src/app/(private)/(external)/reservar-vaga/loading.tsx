import ReservaCTASkeleton from '@/components/ui/CTA/ReservaCTASkeleton';
import MapSkeleton from '@/components/ui/MapSkeleton';
import PageHeaderSkeleton from '@/components/ui/pageHeaderSkeleton';
import TutorialCardSkeleton from '@/components/ui/TutorialCard/TutorialCardSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <PageHeaderSkeleton />

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        <ReservaCTASkeleton />
        <MapSkeleton/>
        <TutorialCardSkeleton />
      </main>
    </div>
  );
}
