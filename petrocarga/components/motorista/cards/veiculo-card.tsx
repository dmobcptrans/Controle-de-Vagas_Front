'use client';

import { useState, useEffect } from 'react';
import { Veiculo } from '@/lib/types/veiculo';
import { useRouter } from 'next/navigation';
import { deleteVeiculo, atualizarVeiculo } from '@/lib/api/veiculoApi';
import { CheckCircle2, AlertCircle, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

type VeiculoDetalhesProps = {
  veiculo: Veiculo;
  onVeiculoAtualizado?: (veiculoAtualizado: Veiculo) => void;
};

export default function VeiculoDetalhes({
  veiculo,
  onVeiculoAtualizado,
}: VeiculoDetalhesProps) {
  const router = useRouter();

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [mensagem, setMensagem] = useState<{
    tipo: 'sucesso' | 'erro' | null;
    texto: string;
  }>({ tipo: null, texto: '' });

  // Estados de edição - sincronizados com o veículo prop
  const [formData, setFormData] = useState({
    id: veiculo.id,
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    placa: veiculo.placa,
    tipo: veiculo.tipo,
    cpfProprietario: veiculo.cpfProprietario || '',
    cnpjProprietario: veiculo.cnpjProprietario || '',
    usuarioId: veiculo.usuarioId || '',
  });

  // Sincroniza o formData quando o veículo prop muda
  useEffect(() => {
    setFormData({
      id: veiculo.id,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      placa: veiculo.placa,
      tipo: veiculo.tipo,
      cpfProprietario: veiculo.cpfProprietario || '',
      cnpjProprietario: veiculo.cnpjProprietario || '',
      usuarioId: veiculo.usuarioId || '',
    });
  }, [veiculo]);

  const handleInput = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fd.append(key, value.toString());
        }
      });

      const resultado = await atualizarVeiculo(fd);

      if (resultado.error) {
        throw new Error(resultado.message);
      }

      // Cria o objeto veículo atualizado
      const veiculoAtualizado: Veiculo = {
        id: formData.id,
        marca: formData.marca,
        modelo: formData.modelo,
        placa: formData.placa,
        tipo: formData.tipo as 'AUTOMOVEL' | 'VUC' | 'CAMINHONETA' | 'CAMINHAO_MEDIO' | 'CAMINHAO_LONGO',
        usuarioId: formData.usuarioId || undefined,
        cpfProprietario: formData.cpfProprietario || null,
        cnpjProprietario: formData.cnpjProprietario || null,
      };

      // Notifica o componente pai com os dados atualizados
      if (onVeiculoAtualizado) {
        onVeiculoAtualizado(veiculoAtualizado);
      }

      setMensagem({
        tipo: 'sucesso',
        texto: 'Veículo atualizado com sucesso!',
      });

      setEditando(false);
    } catch (err: unknown) {
      setMensagem({
        tipo: 'erro',
        texto:
          err instanceof Error ? err.message : 'Erro ao atualizar veículo.',
      });
    }
  };

  const handleExcluir = async () => {
    try {
      await deleteVeiculo(veiculo.id);
      setModalAberto(false);
      router.back();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao excluir veículo.',
      );
    }
  };

  const AlertBox = ({
    tipo,
    texto,
  }: {
    tipo: 'sucesso' | 'erro';
    texto: string;
  }) => {
    const isError = tipo === 'erro';

    return (
      <div
        className={`
        p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 border text-sm sm:text-base
        ${
          isError
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-green-50 border-green-200 text-green-700'
        }
      `}
      >
        {isError ? (
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
        )}
        <span className="break-words flex-1">{texto}</span>
      </div>
    );
  };

  // Função para cancelar edição (restaura os dados originais)
  const handleCancelarEdicao = () => {
    setFormData({
      id: veiculo.id,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      placa: veiculo.placa,
      tipo: veiculo.tipo,
      cpfProprietario: veiculo.cpfProprietario || '',
      cnpjProprietario: veiculo.cnpjProprietario || '',
      usuarioId: veiculo.usuarioId || '',
    });
    setEditando(false);
    setMensagem({ tipo: null, texto: '' });
  };

  return (
    <>
      <article className="relative bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl border-l-4 sm:border-l-8 border-blue-500 transition-all duration-300 w-full">
        {mensagem.tipo && (
          <div className="mb-4 sm:mb-6">
            <AlertBox tipo={mensagem.tipo} texto={mensagem.texto} />
          </div>
        )}

        {/* Header responsivo */}
        <header className="mb-4 sm:mb-6 flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 break-words">
              {formData.marca} {formData.modelo}
            </h2>

            {!editando ? (
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Placa:{' '}
                <span className="font-mono font-semibold">
                  {formData.placa}
                </span>
              </p>
            ) : (
              <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                Modo de edição
              </p>
            )}
          </div>

          {/* Botões responsivos */}
          {!editando ? (
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-0">
              <button
                onClick={() => setEditando(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base flex-1 xs:flex-none justify-center"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Alterar</span>
              </button>
              <button
                onClick={() => setModalAberto(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base flex-1 xs:flex-none justify-center"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Excluir</span>
              </button>
            </div>
          ) : null}
        </header>

        {/* ===================== MODO DE VISUALIZAÇÃO ===================== */}
        {!editando && (
          <section className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 text-gray-700 text-sm sm:text-base mb-4 sm:mb-6">
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <p className="font-semibold text-gray-500 text-xs sm:text-sm mb-1">
                Tipo
              </p>
              <p className="text-gray-800">{formData.tipo}</p>
            </div>

            {formData.cpfProprietario && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="font-semibold text-gray-500 text-xs sm:text-sm mb-1">
                  CPF Proprietário
                </p>
                <p className="text-gray-800 font-mono">
                  {formData.cpfProprietario}
                </p>
              </div>
            )}

            {formData.cnpjProprietario && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg xs:col-span-2">
                <p className="font-semibold text-gray-500 text-xs sm:text-sm mb-1">
                  CNPJ Proprietário
                </p>
                <p className="text-gray-800 font-mono">
                  {formData.cnpjProprietario}
                </p>
              </div>
            )}
          </section>
        )}

        {/* ===================== MODO DE EDIÇÃO ===================== */}
        {editando && (
          <section className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 text-gray-700 text-sm sm:text-base mb-4 sm:mb-6">
            <div className="space-y-1.5">
              <label className="block font-semibold text-gray-600 text-xs sm:text-sm">
                Marca *
              </label>
              <input
                className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.marca}
                onChange={(e) => handleInput('marca', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-gray-600 text-xs sm:text-sm">
                Modelo *
              </label>
              <input
                className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.modelo}
                onChange={(e) => handleInput('modelo', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-gray-600 text-xs sm:text-sm">
                Placa *
              </label>
              <input
                className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                value={formData.placa}
                onChange={(e) => handleInput('placa', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-gray-600 text-xs sm:text-sm">
                Tipo *
              </label>
              <select
                className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                value={formData.tipo}
                onChange={(e) => handleInput('tipo', e.target.value)}
              >
                <option value="AUTOMOVEL">Automóvel</option>
                <option value="VUC">Veículo Urbano de Carga</option>
                <option value="CAMINHONETA">Caminhoneta</option>
                <option value="CAMINHAO_MEDIO">Caminhão Médio</option>
                <option value="CAMINHAO_LONGO">Caminhão Longo</option>
                <option value="CARRETA">Carreta</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-gray-600 text-xs sm:text-sm">
                CPF Proprietário
              </label>
              <input
                className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                value={formData.cpfProprietario}
                onChange={(e) => handleInput('cpfProprietario', e.target.value)}
                placeholder="Opcional"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-gray-600 text-xs sm:text-sm">
                CNPJ Proprietário
              </label>
              <input
                className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                value={formData.cnpjProprietario}
                onChange={(e) =>
                  handleInput('cnpjProprietario', e.target.value)
                }
                placeholder="Opcional"
              />
            </div>
          </section>
        )}

        {/* ===================== BOTÕES DO MODO DE EDIÇÃO ===================== */}
        {editando && (
          <div className="flex flex-col xs:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button
              onClick={handleCancelarEdicao}
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium order-2 xs:order-1"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Cancelar</span>
            </button>

            <button
              onClick={handleSalvar}
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium order-1 xs:order-2"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        )}
      </article>

      {/* ===================== MODAL DE EXCLUSÃO RESPONSIVO ===================== */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay com backdrop blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setModalAberto(false)}
          />

          {/* Modal responsivo */}
          <div className="relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Trash2 className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 text-center">
                Confirmar exclusão
              </h3>
              <p className="text-gray-600 text-sm sm:text-base text-center">
                Tem certeza que deseja excluir o veículo{' '}
                <span className="font-semibold">
                  {veiculo.marca} {veiculo.modelo}
                </span>
                ? Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
              <button
                onClick={() => setModalAberto(false)}
                className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium flex-1"
              >
                Cancelar
              </button>

              <button
                onClick={handleExcluir}
                className="px-4 sm:px-5 py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 font-medium flex-1"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
