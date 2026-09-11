import { Building2 } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 border-gray-200 border-dashed border-2 bg-white rounded-2xl">
      <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-3" />

      <p className="text-sm sm:text-base text-gray-500">
        Nenhuma solicitação encontrada.
      </p>
    </div>
  );
}