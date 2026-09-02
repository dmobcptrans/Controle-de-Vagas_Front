"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

type CTASplitOption = {
  /** Título principal do lado do botão */
  title: string;

  /** Texto curto exibido apenas em telas menores */
  mobileTitle?: string;

  /** Texto de apoio, opcional */
  description?: string;

  /** Ícone exibido no lado do botão */
  icon: ReactNode;

  /** Valor que será escrito no parâmetro da URL quando esse lado for clicado */
  value: string;

  /** Badge numérico opcional */
  badge?: number;
};

type CTASplitProps = {
  /** Nome do parâmetro de busca alterado na URL. Ex: "aba" -> ?aba=pendencias */
  paramName?: string;
  /** Configuração do lado esquerdo (ex: visualizar motoristas conectados) */
  left: CTASplitOption;
  /** Configuração do lado direito (ex: gerenciar pendências) */
  right: CTASplitOption;
};

export function CTASplit({ paramName = "aba", left, right }: CTASplitProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeValue = searchParams.get(paramName) ?? left.value;

  const buildHref = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, value);
    return `${pathname}?${params.toString()}`;
  };

 const renderSide = (
  option: CTASplitOption,
  side: "left" | "right"
) => {
  const isActive = activeValue === option.value;
  const accent =
    side === "left" ? "border-[#FFCD07]" : "border-[#FF7A59]";

  return (
    <Link
      href={buildHref(option.value)}
      scroll={false}
      className={`group relative flex flex-1 items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 transition-colors ${
        isActive ? "bg-white/10" : "bg-transparent hover:bg-white/5"
      } ${side === "left" ? "border-r border-white/10" : ""}`}
    >
      {/* Barra de destaque */}
      <span
        className={`absolute left-0 top-0 h-full w-1 rounded-full transition-opacity ${accent} ${
          isActive
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-40"
        }`}
        style={{
          borderLeftWidth: 4,
          borderLeftStyle: "solid",
        }}
      />

      <div className="pl-2 min-w-0">
        {/* Desktop */}
        <p
          className={`hidden sm:block font-semibold text-[15px] mb-0.5 ${
            isActive ? "text-white" : "text-white/80"
          }`}
        >
          {option.title}
        </p>

        {/* Mobile */}
        <p
          className={`block sm:hidden font-semibold text-sm ${
            isActive ? "text-white" : "text-white/80"
          }`}
        >
          {option.mobileTitle ?? option.title}
        </p>

        {/* Descrição somente desktop */}
        {option.description && (
          <p className="hidden sm:block text-xs text-white/60">
            {option.description}
          </p>
        )}
      </div>

      <div className="relative flex-shrink-0">
        <div
          className={`rounded-xl w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center ${
            isActive ? "bg-white/20" : "bg-white/10"
          }`}
        >
          {option.icon}
        </div>

        {!!option.badge && option.badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF7A59] text-white text-[10px] font-bold flex items-center justify-center">
            {option.badge > 99 ? "99+" : option.badge}
          </span>
        )}
      </div>
    </Link>
  );
};

  return (
    <div className="-mt-4 mb-5">
      <div className="flex w-full rounded-2xl overflow-hidden bg-[#071D41] text-white shadow-sm">
        {renderSide(left, "left")}
        {renderSide(right, "right")}
      </div>
    </div>
  );
}