'use client';

import { useState } from 'react';
import { ReservaGet } from '@/lib/types/reserva';
import { Denunciar } from '@/lib/api/denunciaApi';
import { AlertTriangle } from 'lucide-react';

interface ReservaDenunciaProps {
  reserva: ReservaGet;
  onClose: () => void;
}

type TipoDenuncia = 'USO_INDEVIDO_DA_VAGA' | 'ATRASO_POR_MOTIVO_DE_FORCA_MAIOR' | 'OUTROS';

export default function ReservaDenuncia({
  reserva,
  onClose,
}: ReservaDenunciaProps) {
  const LIMITE_CARACTERES = 300;

  const [tipo, setTipo] = useState<TipoDenuncia>('USO_INDEVIDO_DA_VAGA');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!descricao.trim()) return;

    try {
      setLoading(true);
      setErro(null);

      const formData = new FormData();
      formData.append('descricao', descricao);
      formData.append('reservaId', reserva.id);
      formData.append('tipo', tipo);

      const result = await Denunciar(formData);

      if (!result.success) {
        throw new Error(result.message);
      }

      onClose();
    } catch (err: unknown) {
      setErro('Não foi possível enviar a denúncia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
      {/* Overlay */}
      <div onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Enviar denúncia
            </h2>
            <p className="text-sm text-gray-500">Informe o problema ocorrido</p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-5 flex flex-col gap-4 text-sm">
          {/* Tipo */}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-gray-700">
              Tipo da denúncia
            </label>

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoDenuncia)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="USO_INDEVIDO_DA_VAGA">Uso indevido da vaga</option>
              <option value="ATRASO_POR_MOTIVO_DE_FORCA_MAIOR">Atraso por motivo de força maior</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-gray-700">Descrição</label>

            <textarea
              value={descricao}
              onChange={(e) =>
                setDescricao(e.target.value.slice(0, LIMITE_CARACTERES))
              }
              rows={4}
              placeholder="Descreva o que aconteceu..."
              className="border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <div className="text-xs text-gray-400 text-right">
              {descricao.length}/{LIMITE_CARACTERES} caracteres
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
              {erro}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="p-5 border-t flex flex-col gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading || !descricao.trim()}
            className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition"
          >
            {loading ? 'Enviando denúncia...' : 'Enviar denúncia'}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
