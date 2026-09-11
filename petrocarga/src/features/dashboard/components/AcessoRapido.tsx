import Link from 'next/link';

import { acessoRapidoActions } from '../constants/acessoRapidoActions';
import { Permissao } from '@/lib/types/personas/user';

interface AcessoRapidoProps {
  permissao?: Permissao;
}

export function AcessoRapido({ permissao }: AcessoRapidoProps) {
  if (!permissao) {
    return null;
  }

  const actions =
    permissao in acessoRapidoActions
      ? acessoRapidoActions[permissao as keyof typeof acessoRapidoActions]
      : undefined;

  if (!actions) {
    return null;
  }

  return (
    <div className="mb-5">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
        Acesso rápido
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {actions.map(({ href, icon: Icon, label, desc, iconClass }) => (
          <Link
            key={href}
            href={href}
            className="bg-white border border-gray-100 hover:border-[#1351B4] hover:bg-blue-50/30 rounded-xl p-4 flex flex-col items-center gap-3 transition-colors"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconClass}`}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}