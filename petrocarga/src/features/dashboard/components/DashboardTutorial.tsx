import Link from 'next/link';
import { Info } from 'lucide-react';

export function DashboardTutorial() {
  return (
    <Link
      href="/tutorial#dashboard"
      className="flex items-center gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-4 hover:bg-blue-50/30 transition-colors"
    >
      <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
        <Info className="h-5 w-5 text-[#1351B4]" />
      </div>

      <div>
        <p className="text-sm font-semibold text-[#071D41]">
          Novo por aqui?
        </p>

        <p className="text-xs text-gray-400 mt-0.5">
          Veja como usar o sistema em 3 passos simples
        </p>
      </div>
    </Link>
  );
}