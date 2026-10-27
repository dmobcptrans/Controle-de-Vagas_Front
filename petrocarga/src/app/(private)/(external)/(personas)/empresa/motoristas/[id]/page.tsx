'use client';

import { useMemo, useState } from 'react';
import { VeiculoResponse } from '@/features/veiculos/types/veiculo';
import VeiculoCard from '@/features/veiculos/components/(motorista)/veiculo-item';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/features/usuarios/auth/service/useAuth';
import { VeiculosAssociadosAoMotoristaParams } from '@/features/usuarios/veiculoMotoristaEmpresa/types/veiculoMotoristaEmpresa';
import { useVeiculoEmpresaMotoristaInteraction } from '@/features/usuarios/veiculoMotoristaEmpresa/hooks/useVeiculoEmpresaMotoristaInteraction';
import { useVeiculosAssociadosAoMotorista } from '@/features/usuarios/veiculoMotoristaEmpresa/hooks/useVeiculosAssociadosAoMotorista';
import { CTA } from '@/components/ui/CTA/CTA';
import { ChevronLeft, ChevronRight, Info, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import VincularVeiculoMotoristaModal from '@/features/usuarios/(personas)/empresas/components/modal/VincularVeiculoMotoristaModal';
import ModalConfirmacaoExclusao from '@/features/reserva/reservas/components/modal/confirmacaoExclusao';
import { Header } from '@/components/ui/Header/Header';

const TAMANHO_PAGINA = 10;

export default function MotoristaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

const params = useMemo<VeiculosAssociadosAoMotoristaParams>(
  () => ({
    pagina: 0,
    tamanhoPagina: TAMANHO_PAGINA,
    ordem: 'ASC',
  }),
  [],
);

const {
  veiculos,
  loading,
  jaBuscou,
  pagina,
  totalPaginas,
  totalElementos,
  buscar,
  recarregar,
} = useVeiculosAssociadosAoMotorista({
  empresaId: user?.id,
  motoristaId: id,
  params,
  buscarAutomaticamente: Boolean(user?.id && id),
});

  const { desvincular, loading: desvinculando } =
    useVeiculoEmpresaMotoristaInteraction();

  const [modalAberto, setModalAberto] = useState(false);
  const [veiculoParaDesvincular, setVeiculoParaDesvincular] =
    useState<VeiculoResponse | null>(null);

  const carregando = loading || !jaBuscou;

const irParaPagina = (novaPagina: number) => {
  if (novaPagina < 0 || novaPagina >= totalPaginas) return;

  buscar({ ...params, pagina: novaPagina });
};

  function abrirConfirmacaoDesvincular(veiculo: VeiculoResponse) {
    setVeiculoParaDesvincular(veiculo);
  }

  function fecharConfirmacaoDesvincular() {
    if (desvinculando) return;
    setVeiculoParaDesvincular(null);
  }

  async function handleDesvincular() {
    if (!user?.id || !id || !veiculoParaDesvincular) return;

    const result = await desvincular({
      empresaId: user.id,
      veiculoId: veiculoParaDesvincular.id,
      motoristaId: id,
    });

    if (result === null) {
      toast.error('Erro ao desvincular veículo');
      return;
    }

    toast.success('Veículo desvinculado com sucesso!');
    setVeiculoParaDesvincular(null);

    // Se removeu o último item da página, volta uma página
    const eraUltimoDaPagina = veiculos.length === 1 && pagina > 0;
    if (eraUltimoDaPagina) {
      buscar({ ...params, pagina: pagina - 1 });
    } else {
      recarregar();
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Header title="Veículos do motorista" showDate />

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        <div className="-mt-4 mb-5">
          <CTA
            title="Vincular veículo"
            description="Associe um veículo da empresa a este motorista."
            icon={<Plus className="h-5 w-5 text-white" />}
            onClick={() => setModalAberto(true)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          {carregando ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2 text-center">
              <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
              <span className="text-gray-600">Carregando seus veículos...</span>
            </div>
          ) : veiculos.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 border-gray-200 border-dashed border-2 bg-white rounded-2xl">
              <p className="text-sm sm:text-base text-gray-500">
                Nenhum veículo encontrado.
              </p>
              <Button
                onClick={() => setModalAberto(true)}
                className="mt-4 cursor-pointer"
                variant="outline"
                size="sm"
              >
                Vincular o primeiro veículo
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 w-full mt-4">
                {veiculos.map((veiculo) => (
                  <VeiculoCard
                    key={veiculo.id}
                    veiculo={veiculo}
                    type="empresa"
                    onDesvincular={() => abrirConfirmacaoDesvincular(veiculo)}
                  />
                ))}
              </div>

              {totalPaginas > 1 && (
                <div className="flex items-center justify-between mt-6 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <Button
                    onClick={() => irParaPagina(pagina - 1)}
                    disabled={pagina === 0}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    <p>
                      Página <span className="font-semibold">{pagina + 1}</span>{' '}
                      de <span className="font-semibold">{totalPaginas}</span>
                    </p>
                    <p className="text-gray-400">
                      {totalElementos} veículo
                      {totalElementos !== 1 ? 's' : ''} no total
                    </p>
                  </div>

                  <Button
                    onClick={() => irParaPagina(pagina + 1)}
                    disabled={pagina >= totalPaginas - 1}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <Link
          href="/tutorial#dashboard"
          className="mt-6 flex items-center gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-4 hover:bg-blue-50/30 transition-colors"
        >
          <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
            <Info className="h-5 w-5 text-[#1351B4]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#071D41]">
              Novo por aqui?
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Veja como usar o sistema em 3 passos simples
            </p>
          </div>
        </Link>
      </main>

      {user?.id && id && (
        <VincularVeiculoMotoristaModal
          empresaId={user.id}
          motoristaId={id}
          open={modalAberto}
          onOpenChange={setModalAberto}
          onSuccess={recarregar}
        />
      )}

      <ModalConfirmacaoExclusao
        isOpen={Boolean(veiculoParaDesvincular)}
        onClose={fecharConfirmacaoDesvincular}
        onConfirm={handleDesvincular}
        mensagem="Deseja mesmo desvincular este veículo? Essa ação não poderá ser desfeita."
      />
    </div>
  );
}
