'use client';

import { ViewMap } from '@/components/map/viewMap';
import { useState } from 'react';
import { ListaVagas } from '@/components/lista/listaVagas';

/**
 * @component Page
 * @version 1.0.0
 *
 * @description Página de visualização de vagas com mapa interativo.
 * Apresenta um layout dividido com mapa à esquerda e lista de vagas à direita.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. ESTRUTURA DA PÁGINA:
 *    - Layout responsivo em duas colunas (flex-col no mobile, flex-row no desktop)
 *    - Mapa interativo (ViewMap) na coluna esquerda
 *    - Lista de vagas (ListaVagas) na coluna direita
 *
 * 2. INTERAÇÕES:
 *    - selectedPlace: estado compartilhado que pode ser usado para destacar uma vaga
 *    - Ao selecionar um local no mapa, a lista pode refletir a seleção
 *    - Ao clicar em uma vaga na lista, o mapa pode centralizar nela
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - COMPONENTE CLIENT: Necessário para:
 *   - useState (controle de seleção)
 *   - Interatividade entre mapa e lista
 *   - Renderização condicional
 *
 * - LAYOUT RESPONSIVO:
 *   - Mobile: empilhamento vertical (flex-col)
 *   - Desktop: duas colunas lado a lado (flex-row)
 *   - Altura fixa de 70vh para ambos os componentes
 *   - Altura mínima de 300px para não ficar muito pequeno
 *
 * - ESTADO COMPARTILHADO:
 *   - selectedPlace é passado para o mapa via props
 *   - Pode ser atualizado pela lista de vagas (callback futuro)
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - ViewMap: Componente de mapa interativo
 * - ListaVagas: Componente de listagem de vagas
 *
 * @example
 * ```tsx
 * // Uso em rota pública
 * <Page />
 * ```
 *
 * @see /src/components/map/viewMap.tsx - Mapa interativo
 * @see /src/components/lista/listaVagas.tsx - Lista de vagas
 */

export default function Page() {
  // --------------------------------------------------------------------------
  // ESTADO COMPARTILHADO
  // --------------------------------------------------------------------------

  /**
   * selectedPlace: Local selecionado no mapa ou na lista
   * - Pode ser um ID de vaga ou objeto com coordenadas
   * - Atualizado quando usuário interage com mapa ou lista
   */
  const [selectedPlace, setSelectedPlace] = useState(null);

  return (
    <main className="container mx-auto flex flex-col md:flex-row items-stretch gap-4 mt-2 mb-2">
      {/* --------------------------------------------------------------------
        COLUNA ESQUERDA - MAPA
      -------------------------------------------------------------------- */}
      <div className="flex-1 h-[70vh] min-h-[300px]">
        <ViewMap selectedPlace={selectedPlace} />
      </div>

      {/* --------------------------------------------------------------------
        COLUNA DIREITA - LISTA DE VAGAS
      -------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col bg-blue-100 h-[70vh] min-h-[300px] p-4 rounded-lg shadow-md ">
        <ListaVagas />
      </div>
    </main>
  );
}
