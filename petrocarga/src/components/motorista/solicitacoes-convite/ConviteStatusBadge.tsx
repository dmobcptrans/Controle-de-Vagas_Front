import { Check, Clock3, X } from 'lucide-react';
import type { ConviteMotoristaEmpresaListaItem } from '@/lib/types/conviteMotoristaEmpresa';

interface ConviteStatusBadgeProps {
  status: ConviteMotoristaEmpresaListaItem['status'];
}

export default function ConviteStatusBadge({ status }: ConviteStatusBadgeProps) {
  const getStatus = () => {
    switch (status) {
      case 'ACEITO':
        return {
          label: 'Aceito',
          className: 'bg-green-100 text-green-700 border-green-200',
          icon: <Check className="w-3.5 h-3.5" />,
        };

      case 'RECUSADO':
        return {
          label: 'Recusado',
          className: 'bg-red-100 text-red-700 border-red-200',
          icon: <X className="w-3.5 h-3.5" />,
        };

      default:
        return {
          label: 'Pendente',
          className: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: <Clock3 className="w-3.5 h-3.5" />,
        };
    }
  };

  const { label, className, icon } = getStatus();

  return (
    <span
      className={`
        shrink-0
        inline-flex
        items-center
        gap-1
        px-2.5
        py-1
        rounded-full
        border
        text-[11px]
        sm:text-xs
        font-medium
        ${className}
      `}
    >
      {icon}
      {label}
    </span>
  );
}