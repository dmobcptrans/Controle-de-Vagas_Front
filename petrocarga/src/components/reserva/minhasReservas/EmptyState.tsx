import { CopyPlus } from "lucide-react";
import Link from "next/link";

export default function EmptyState() {
  return (
    <Link
      href="/reservar-vaga"
      className="flex items-center justify-between bg-[#071D41] hover:bg-[#0C3D8A] transition-colors rounded-2xl px-5 py-4 border-l-4 border-[#FFCD07]"
    >
      <div>
        <p className="text-white font-semibold text-[15px] mb-0.5">
          Nenhuma Reserva Ativa
        </p>
        <p className="text-white/60 text-xs">Fazer Reserva</p>
      </div>
      <div className="bg-white/15 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
        <CopyPlus className="h-5 w-5 text-white" />
      </div>
    </Link>
  );
}