import { Info } from "lucide-react";

export default function InfoCard() {
  return (
    <div className="flex items-center gap-3 sm:gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-3 sm:p-4 mt-6 sm:mt-8">
      <div className="bg-blue-50 rounded-xl w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
        <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[#1351B4]" />
      </div>

      <div>
        <p className="text-sm sm:text-base font-semibold text-[#071D41]">
          Sobre as solicitações
        </p>

        <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
          Aceite uma solicitação para criar um vínculo com a empresa.
        </p>
      </div>
    </div>
  );
}