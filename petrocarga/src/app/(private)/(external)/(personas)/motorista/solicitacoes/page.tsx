'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/ui/Header/Header';
import ModalConfirmacaoExclusao from '@/features/reserva/reservas/components/modal/confirmacaoExclusao';

import { useAuth } from '@/features/usuarios/auth/service/useAuth';
import { useConvitesMotorista } from '@/features/usuarios/conviteMotoristaEmpresa/hooks/useConviteMotorista';

import type { ConviteMotoristaEmpresaListaItem } from '@/features/usuarios/conviteMotoristaEmpresa/types/conviteMotoristaEmpresa';

import ConvitePendenteCTA from '@/features/usuarios/conviteMotoristaEmpresa/components/(motorista)/solicitacoes-convite/ConvitePendenteCTA';
import SemVinculoCard from '@/features/usuarios/conviteMotoristaEmpresa/components/(motorista)/solicitacoes-convite/SemVinculoCard';
import PaginationControls from '@/features/usuarios/conviteMotoristaEmpresa/components/(motorista)/solicitacoes-convite/PaginationControls';
import ConviteCard from '@/features/usuarios/conviteMotoristaEmpresa/components/(motorista)/solicitacoes-convite/ConviteCard';

import { calcularDiasRestantes } from '@/features/usuarios/conviteMotoristaEmpresa/components/(motorista)/solicitacoes-convite/utils/convite-motorista-empresa-datas';
import ErrorState from '@/features/usuarios/conviteMotoristaEmpresa/components/(motorista)/state/ErrorState';
import EmptyState from '@/features/usuarios/conviteMotoristaEmpresa/components/(motorista)/state/EmptyState';
import InfoCard from '@/features/usuarios/conviteMotoristaEmpresa/components/(motorista)/cards/InfoCard';
import LoadingState from '@/features/usuarios/conviteMotoristaEmpresa/components/(motorista)/state/LoadingState';

export default function SolicitacoesConvite() {
  const { user, refreshUser } = useAuth();

  const [modalDesvincularAberto, setModalDesvincularAberto] = useState(false);

  const {
    convites,
    pagina: paginaAtual,
    totalPaginas,
    totalElementos,
    tamanhoPagina,
    loading,
    error,
    respondingId,
    buscar: buscarConvites,
    responder,
    desvincular,
  } = useConvitesMotorista({
    motoristaId: user?.id,
  });

  // ---------------------------------------------------------------------------
  // ESTADOS DERIVADOS
  // ---------------------------------------------------------------------------

  const empresaVinculada = Boolean(user?.dadosExtras?.empresaId);

  const convitePendenteDestaque = useMemo(() => {
    if (empresaVinculada) {
      return null;
    }

    return (
      convites.find((convite) => {
        if (convite.status !== 'PENDENTE') {
          return false;
        }

        const tempoRestante = calcularDiasRestantes(convite.criadoEm);

        return !tempoRestante?.expirado;
      }) ?? null
    );
  }, [convites, empresaVinculada]);

  const possuiConvitePendente = useMemo(() => {
    return convites.some((convite) => {
      if (convite.status !== 'PENDENTE') {
        return false;
      }

      const tempoRestante = calcularDiasRestantes(convite.criadoEm);

      return !tempoRestante?.expirado;
    });
  }, [convites]);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  const handleResponder = async (
    convite: ConviteMotoristaEmpresaListaItem,
    status: 'ACEITO' | 'RECUSADO',
  ) => {
    const sucesso = await responder(convite, status);

    if (sucesso) {
      await refreshUser();
    }
  };

  const handleDesvincular = async () => {
    const empresaId = user?.dadosExtras?.empresaId;
    const motoristaId = user?.id;

    if (!empresaId || !motoristaId) {
      return;
    }

    const sucesso = await desvincular(empresaId, motoristaId);

    if (!sucesso) {
      return;
    }

    setModalDesvincularAberto(false);

    await refreshUser();
    await buscarConvites(paginaAtual);
  };

  const handlePageChange = (novaPagina: number) => {
    const paginaInvalida =
      novaPagina < 0 ||
      novaPagina >= totalPaginas ||
      novaPagina === paginaAtual;

    if (paginaInvalida) {
      return;
    }

    buscarConvites(novaPagina);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Header
        title="Solicitações de conexão"
        pagination={
          totalElementos > 0
            ? {
                totalElementos,
                totalPaginas,
                tamanhoPagina,
                pagina: paginaAtual,
              }
            : undefined
        }
      />

      <main className="px-3 sm:px-6 md:px-8 pb-12 sm:pb-16 max-w-4xl mx-auto">
        {/* CONVITE PENDENTE / SEM VÍNCULO */}
        <div className="-mt-4 mb-5">
          {convitePendenteDestaque ? (
            <ConvitePendenteCTA
              convite={convitePendenteDestaque}
              responding={respondingId === convitePendenteDestaque.id}
              onResponder={handleResponder}
            />
          ) : (
            <SemVinculoCard />
          )}
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => buscarConvites(paginaAtual)}
          />
        ) : (
          <>
            {/* EMPRESA VINCULADA */}
            {empresaVinculada && (
              <ConviteCard
                razaoSocial={user?.dadosExtras?.empresaRazaoSocial}
                cnpj={user?.dadosExtras?.empresaCnpj}
                onDesvincular={() => setModalDesvincularAberto(true)}
                disabled={respondingId !== null}
              />
            )}

            {/* NENHUMA SOLICITAÇÃO */}
            {!empresaVinculada && !possuiConvitePendente && <EmptyState />}

            {/* PAGINAÇÃO */}
            {convites.length > 0 && totalPaginas > 1 && (
              <PaginationControls
                currentPage={paginaAtual}
                totalPages={totalPaginas}
                totalElements={totalElementos}
                currentPageSize={tamanhoPagina}
                onPageChange={handlePageChange}
                isLoading={loading}
              />
            )}
          </>
        )}

        {/* INFORMAÇÕES */}
        <InfoCard />
      </main>

      {/* MODAL */}
      <ModalConfirmacaoExclusao
        isOpen={modalDesvincularAberto}
        onClose={() => setModalDesvincularAberto(false)}
        onConfirm={handleDesvincular}
        titulo="Desvincular da empresa"
        mensagem={`Tem certeza que deseja se desvincular da empresa "${
          user?.dadosExtras?.empresaRazaoSocial ?? 'empresa'
        }"?`}
      />
    </div>
  );
}
