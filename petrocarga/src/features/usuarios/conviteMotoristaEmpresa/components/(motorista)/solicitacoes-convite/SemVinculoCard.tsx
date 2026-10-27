import { Building2 } from 'lucide-react';

export default function SemVinculoCard() {
  return (
    <div
      className="
        bg-white
        border border-gray-100
        rounded-2xl
        p-4
        sm:p-5
        shadow-sm
        flex
        items-center
        gap-3
      "
    >
      <div
        className="
          w-10 h-10
          rounded-xl
          bg-blue-800
          flex items-center justify-center
          shrink-0
        "
      >
        <Building2 className="w-5 h-5 text-white" />
      </div>

      <div>
        <h2 className="font-semibold text-gray-800 text-sm sm:text-base">
          Convites para conexão
        </h2>

        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Empresas podem solicitar um vínculo com você.
        </p>
      </div>
    </div>
  );
}