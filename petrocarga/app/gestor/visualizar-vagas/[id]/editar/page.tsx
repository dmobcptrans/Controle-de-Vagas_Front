'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditarVaga from '@/components/gestor/editar/edicao-vaga';
import { Vaga } from '@/lib/types/vaga';
import { useAuth } from '@/components/hooks/useAuth';
import { getVagaById } from '@/lib/api/vagaApi';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditarVagaPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { loading: authLoading } = useAuth();

  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchVaga = async () => {
      setLoading(true);
      try {
        const vagaData = await getVagaById(id);
        if (!vagaData) {
          router.replace('/gestor/visualizar-vagas');
        } else {
          setVaga(vagaData);
        }
      } catch (err) {
        router.replace('/gestor/visualizar-vagas');
      } finally {
        setLoading(false);
      }
    };

    fetchVaga();
  }, [id, router]);

  if (authLoading || loading) {
    return <p>Carregando vaga...</p>;
  }

  if (!vaga) {
    return (
      <div>
        <p>Vaga não encontrada</p>
        <Link
          href="/visualizar-vagas"
          className="text-blue-600 hover:underline"
        >
          Voltar para lista de vagas
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <Link
          href={`/gestor/visualizar-vagas/${id}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para detalhes
        </Link>
      </div>

      <EditarVaga vaga={vaga} />
    </div>
  );
}
