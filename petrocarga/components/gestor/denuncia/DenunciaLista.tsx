'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Archive, AlertTriangle } from 'lucide-react';
import DenunciaCard from '@/components/gestor/cards/denuncia-card';
import { Denuncia } from '@/lib/types/denuncias';

/**
 * Prioridade para ordenação das denúncias
 * Quanto menor o número, maior a prioridade
 */
const PRIORIDADE: Record<string, number> = {
  ABERTA: 1,
  EM_ANALISE: 2,
  PROCEDENTE: 3,
  IMPROCEDENTE: 4,
};

/**
 * Denúncias visíveis (não arquivadas)
 * Exibidas na seção principal
 */
const VISIBLE_STATUSES = new Set(['ABERTA', 'EM_ANALISE']);

/**
 * Denúncias ocultas (arquivadas/histórico)
 * Exibidas em seção colapsável
 */
const HIDDEN_STATUSES = new Set(['PROCEDENTE', 'IMPROCEDENTE']);

/**
 * @function sortDenuncias
 * @description Ordena denúncias por prioridade (ABERTA > EM_ANALISE > PROCEDENTE > IMPROCEDENTE)
 */
const sortDenuncias = (a: Denuncia, b: Denuncia) => {
  const sa = (a.status || '').toUpperCase();
  const sb = (b.status || '').toUpperCase();
  const pa = PRIORIDADE[sa] ?? 999;
  const pb = PRIORIDADE[sb] ?? 999;
  return pa - pb;
};

interface DenunciaListaProps {
  denuncias: Denuncia[];
  /** Chamado quando uma denúncia é finalizada, para o parent refazer o fetch */
  onRefresh?: () => void;
}

/**
 * @component DenunciaLista
 * @version 1.0.0
 * 
 * @description Lista de denúncias com separação entre ativas e histórico.
 * Denúncias ativas (ABERTA/EM_ANALISE) são exibidas sempre.
 * Denúncias encerradas (PROCEDENTE/IMPROCEDENTE) ficam em seção colapsável.
 * 
 * ----------------------------------------------------------------------------
 * 📋 ESTRUTURA:
 * ----------------------------------------------------------------------------
 * 
 * 1. SEÇÃO PRINCIPAL (DENÚNCIAS ATIVAS):
 *    - Exibe denúncias com status ABERTA ou EM_ANALISE
 *    - Ordenadas por prioridade (ABERTA primeiro)
 *    - Estado vazio: mensagem amigável
 * 
 * 2. SEÇÃO DE HISTÓRICO (COLAPSÁVEL):
 *    - Exibe denúncias com status PROCEDENTE ou IMPROCEDENTE
 *    - Mostra contador de itens no botão
 *    - Pode ser expandido/recolhido
 *    - Transição suave com grid-rows
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - SEPARAÇÃO POR STATUS: VISIBLE_STATUSES e HIDDEN_STATUSES definem onde cada status aparece
 * - ORDENAÇÃO: PRIORIDADE mapeia ordem de exibição (ABERTA > EM_ANALISE > PROCEDENTE > IMPROCEDENTE)
 * - COLLAPSE: grid-rows-[1fr]/[0fr] + transition-all para animação suave
 * - MEMO: useMemo para processamento da lista (evita recálculos desnecessários)
 * - EMPTY STATE: Exibido quando não há denúncias ativas
 * - CALLBACK: onRefresh para atualizar lista após ações
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - DenunciaCard: Card individual de denúncia
 * - Denuncia: Tipo de denúncia
 * 
 * @example
 * ```tsx
 * <DenunciaLista
 *   denuncias={denuncias}
 *   onRefresh={() => fetchDenuncias()}
 * />
 * ```
 */

export default function DenunciaLista({
  denuncias,
  onRefresh,
}: DenunciaListaProps) {
  const [mostrarOcultas, setMostrarOcultas] = useState(false);

  /**
   * Separa denúncias em visíveis (ativas) e ocultas (histórico)
   * Ordena ambas por prioridade
   */
  const { visiveis, ocultas } = useMemo(() => {
    const buckets = denuncias.reduce(
      (acc, d) => {
        const status = (d.status || '').toUpperCase();
        if (VISIBLE_STATUSES.has(status)) acc.visiveis.push(d);
        else if (HIDDEN_STATUSES.has(status)) acc.ocultas.push(d);
        return acc;
      },
      { visiveis: [] as Denuncia[], ocultas: [] as Denuncia[] },
    );

    return {
      visiveis: [...buckets.visiveis].sort(sortDenuncias),
      ocultas: [...buckets.ocultas].sort(sortDenuncias),
    };
  }, [denuncias]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      
      {/* ==================== SEÇÃO PRINCIPAL (DENÚNCIAS ATIVAS) ==================== */}
      <section className="flex flex-col gap-4 animate-in fade-in duration-500">
        {visiveis.length > 0 ? (
          visiveis.map((denuncia) => (
            <DenunciaCard
              key={denuncia.id}
              denuncia={denuncia}
              onRefresh={onRefresh}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </section>

      {/* ==================== SEÇÃO DE HISTÓRICO (COLAPSÁVEL) ==================== */}
      {ocultas.length > 0 && (
        <div className="border-t border-gray-100 pt-6">
          
          {/* Botão de toggle */}
          <button
            type="button"
            onClick={() => setMostrarOcultas((s) => !s)}
            className="group w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all active:scale-[0.99]"
            aria-expanded={mostrarOcultas}
            aria-controls="denuncias-historico"
          >
            <div className="flex items-center gap-3 text-gray-600">
              <Archive className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm font-medium">
                {mostrarOcultas ? 'Ocultar histórico' : 'Ver histórico'}
              </span>
              <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full">
                {ocultas.length}
              </span>
            </div>
            {mostrarOcultas ? (
              <ChevronUp className="w-4 h-4 text-gray-400" aria-hidden />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden />
            )}
          </button>

          {/* Conteúdo colapsável (transição suave) */}
          <div
            id="denuncias-historico"
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
              mostrarOcultas ? 'grid-rows-[1fr] mt-4' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden min-h-0">
              <div className="flex flex-col gap-3 pb-2">
                {ocultas.map((denuncia) => (
                  <div
                    key={denuncia.id}
                    className="opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <DenunciaCard
                      denuncia={denuncia}
                      onRefresh={onRefresh}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @component EmptyState
 * @description Componente exibido quando não há denúncias ativas
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <div className="bg-white p-3 rounded-full shadow-sm mb-4">
        <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-gray-400" aria-hidden />
      </div>
      <h3 className="text-gray-900 font-semibold text-lg md:text-xl mb-2">
        Nenhuma denúncia ativa
      </h3>
      <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
        Todas as denúncias já foram analisadas.
      </p>
    </div>
  );
}