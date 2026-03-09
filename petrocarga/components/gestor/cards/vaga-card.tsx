'use client';

import { useState } from 'react';
import { Vaga, DiaSemana } from '@/lib/types/vaga';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CardMap from '@/components/map/cardMap';
import { deleteVaga } from '@/lib/api/vagaApi';
import toast from 'react-hot-toast';

type VagaDetalhesProps = {
  vaga: Vaga;
};

const diasSemana: DiaSemana[] = [
  'DOMINGO',
  'SEGUNDA',
  'TERCA',
  'QUARTA',
  'QUINTA',
  'SEXTA',
  'SABADO',
];

export default function VagaDetalhes({ vaga }: VagaDetalhesProps) {
  const [diaSelecionado, setDiaSelecionado] = useState<DiaSemana | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const router = useRouter();

  const horariosPorDia = new Map<DiaSemana, string>();
  vaga.operacoesVaga.forEach((op) => {
    horariosPorDia.set(
      op.diaSemanaAsEnum,
      `${op.horaInicio.slice(0, 5)} - ${op.horaFim.slice(0, 5)}`,
    );
  });

  const handleExcluir = async () => {
    try {
      await deleteVaga(vaga.id);
      setModalAberto(false);
      router.back();
    } catch {
      toast.error('Erro ao excluir vaga. Tente novamente.');
    }
  };

  return (
    <article className="relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl border-l-8 border-blue-500 transition-shadow max-w-4xl mx-auto">
      <header className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div
          className={cn(
            'absolute top-4 right-4 w-4 h-4 rounded-full shadow-md',
            vaga.status === 'DISPONIVEL' && 'bg-green-500',
            vaga.status === 'INDISPONIVEL' && 'bg-red-500',
            vaga.status === 'MANUTENCAO' && 'bg-yellow-400',
          )}
          title={vaga.status}
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-gray-800 truncate">
            {vaga.endereco.logradouro}
          </h2>
          <p className="text-gray-600 mt-1 truncate">{vaga.endereco.bairro}</p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-5">
          <Link
            href={`/gestor/visualizar-vagas/${vaga.id}/editar`}
            className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition inline-block"
          >
            Alterar
          </Link>
          <button
            onClick={() => setModalAberto(true)}
            className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
          >
            Excluir
          </button>
        </div>
      </header>

      <div className="w-full h-48 mb-6 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        <CardMap vaga={vaga} />
      </div>

      <section className="mb-4 flex flex-wrap gap-2">
        {diasSemana.map((dia) => {
          const ativo = horariosPorDia.has(dia);
          const selecionado = diaSelecionado === dia;

          return (
            <button
              key={dia}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition',
                ativo
                  ? selecionado
                    ? 'bg-green-500 text-white'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed',
              )}
              disabled={!ativo}
              onClick={() => setDiaSelecionado(ativo ? dia : null)}
            >
              {dia.slice(0, 3)}
            </button>
          );
        })}
      </section>

      {diaSelecionado && horariosPorDia.has(diaSelecionado) && (
        <p className="mb-6 text-gray-700 text-sm">
          <strong>Horário de {diaSelecionado}:</strong>{' '}
          {horariosPorDia.get(diaSelecionado)}
        </p>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-sm mb-4">
        <p>
          <strong>Comprimento:</strong> {vaga.comprimento} m
        </p>
        <p>
          <strong>Área:</strong> {vaga.area}
        </p>
        <p>
          <strong>Tipo:</strong> {vaga.tipoVaga}
        </p>
      </section>

      <section className="border-t pt-4 text-xs text-gray-500 space-y-1">
        <p>
          <strong>Código PMP:</strong> {vaga.endereco.codigoPmp}
        </p>
        <p>
          <strong>ID da vaga:</strong> {vaga.id}
        </p>
        <p>
          <strong>Referência do endereço:</strong> {vaga.referenciaEndereco}
        </p>
        <p>
          <strong>Número da vaga:</strong> {vaga.numeroEndereco}
        </p>
        <p>
          <strong>Localização GPS início:</strong> {vaga.referenciaGeoInicio}
        </p>
        <p>
          <strong>Localização GPS fim:</strong> {vaga.referenciaGeoFim}
        </p>
      </section>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setModalAberto(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-96 max-w-full shadow-2xl transform transition-all duration-300 scale-95 animate-scaleIn">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Confirmar exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir esta vaga? Esta ação não pode ser
              desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
