// components/gestor/modals/NotificacaoModal.tsx
'use client';

import { useState } from 'react';
import { Bell, X, Send } from 'lucide-react';
import { enviarNotificacaoParaUsuario } from '@/lib/api/notificacaoApi';
import { useAuth } from '@/components/hooksGerais/useAuth';

interface NotificacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioId: string;
  usuarioNome: string;
  tipoUsuario: 'MOTORISTA' | 'AGENTE' | 'GESTOR';
}

export function NotificacaoModal({
  isOpen,
  onClose,
  usuarioId,
  usuarioNome,
  tipoUsuario,
}: NotificacaoModalProps) {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipo, setTipo] = useState<
    'RESERVA' | 'VAGA' | 'VEICULO' | 'MOTORISTA' | 'SISTEMA'
  >('SISTEMA');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('usuarioId', usuarioId);
      formData.append('titulo', titulo);
      formData.append('mensagem', mensagem);
      formData.append('tipo', tipo);
      formData.append(
        'metada',
        JSON.stringify({
          remetente: {
            id: user?.id,
            nome: user?.nome,
            permissao: user?.permissao,
          },
          destinatario: {
            id: usuarioId,
            nome: usuarioNome,
            tipo: tipoUsuario,
          },
          enviadoEm: new Date().toISOString(),
        }),
      );

      const result = await enviarNotificacaoParaUsuario(formData);

      if (result.error) {
        setError(result.message);
      } else {
        setSuccess('Notificação enviada com sucesso!');
        setTitulo('');
        setMensagem('');
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 2000);
      }
    } catch (err) {
      setError('Erro ao enviar notificação. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-lg p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Enviar Notificação
              </h3>
              <p className="text-sm text-gray-500">
                Para: {usuarioNome} ({tipoUsuario.toLowerCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Digite o título da notificação"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={100}
            />
          </div>

          {/* Mensagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem
            </label>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Digite a mensagem da notificação"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
              maxLength={500}
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={tipo}
              onChange={(e) =>
                setTipo(
                  e.target.value as
                    | 'RESERVA'
                    | 'VAGA'
                    | 'VEICULO'
                    | 'MOTORISTA'
                    | 'SISTEMA',
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SISTEMA">Sistema</option>
              <option value="RESERVA">Reserva</option>
              <option value="VAGA">Vaga</option>
              <option value="VEICULO">Veículo</option>
              <option value="MOTORISTA">Motorista</option>
            </select>
          </div>

          {/* Status */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !titulo.trim() || !mensagem.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Notificação
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
