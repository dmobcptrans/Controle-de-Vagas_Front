import { Loader2 } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
      <Loader2 className="animate-spin w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />

      <span className="text-sm sm:text-base text-gray-600">
        Carregando solicitações...
      </span>
    </div>
  );
}