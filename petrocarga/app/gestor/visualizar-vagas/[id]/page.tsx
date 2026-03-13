'use client';

import { useEffect, useState } from 'react';
import VagaDetalhes from '@/components/gestor/cards/vaga-card';
import * as vagaActions from '@/lib/api/vagaApi';
import { Vaga } from '@/lib/types/vaga';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VagaPosting() {
  const params = useParams() as { id: string };

  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchVaga() {
      setLoading(true);
      setError('');

      try {
        const vagaData = await vagaActions.getVagaById(params.id);

        if (!vagaData) {
          setError('Vaga não encontrada.');
        } else {
          setVaga(vagaData);
        }
      } catch {
        setError('Erro ao buscar vaga.');
      } finally {
        setLoading(false);
      }
    }

    fetchVaga();
  }, [params.id]);

  if (loading) return <p className="text-center mt-6">Carregando vaga...</p>;

  if (error)
    return (
      <div className="text-center mt-6 text-red-600">
        {error} <br />
        <Link
          href="/gestor/visualizar-vagas"
          className="text-blue-600 underline"
        >
          Voltar para todas as vagas
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <Link
          href="/gestor/visualizar-vagas"
          className="text-muted-foreground hover:text-foreground inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Todas as Vagas
        </Link>
      </div>

      {/* Exibe os dados da vaga */}
      {vaga && <VagaDetalhes vaga={vaga} />}
    </div>
  );
}
