'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Key, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { ativarConta, reenviarCodigoAtivacao } from '@/lib/api/recuperacaoApi';
import ModalTermos from './ModalTermos';

interface ModalAtivacaoContaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  cpfInicial?: string;
}

/**
 * @component ModalAtivacaoConta
 * @version 1.0.0
 * 
 * @description Modal para ativação de conta de usuário.
 * Permite inserir CPF e código de ativação, reenviar código e aceitar termos.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 * 
 * 1. ATIVAÇÃO DE CONTA:
 *    - Usuário insere CPF (apenas números, 11 dígitos)
 *    - Usuário insere código de ativação (recebido por email)
 *    - Usuário aceita os termos de uso
 *    - Clique em "Ativar Conta" → chama API ativarConta
 * 
 * 2. REENVIO DE CÓDIGO:
 *    - Usuário pode solicitar novo código via botão "Solicitar novo código"
 *    - Valida CPF antes do envio
 *    - Feedback visual com loading spinner
 * 
 * 3. TERMOS DE USO:
 *    - Checkbox obrigatório para ativação
 *    - Link para abrir modal com termos completos (ModalTermos)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - MÁSCARA CPF: Apenas números, máximo 11 caracteres
 * - FEEDBACK: Mensagens de erro/sucesso com ícones e cores
 * - LOADING: Estados separados para ativação e reenvio
 * - AUTO-FECHAR: Após sucesso, modal fecha após 2 segundos
 * - RESET: Ao fechar, limpa todos os campos e mensagens
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - Dialog: Componente de modal do shadcn/ui
 * - Checkbox: Componente de checkbox
 * - ModalTermos: Modal com termos completos
 * - ativarConta, reenviarCodigoAtivacao: APIs de ativação
 * 
 * @example
 * ```tsx
 * <ModalAtivacaoConta
 *   open={mostrarModal}
 *   onOpenChange={setMostrarModal}
 *   onClose={handleCloseModal}
 *   cpfInicial="12345678900"
 * />
 * ```
 */

export default function ModalAtivacaoConta({
  open,
  onOpenChange,
  onClose,
  cpfInicial = '',
}: ModalAtivacaoContaProps) {
  // ==================== ESTADOS ====================
  const [cpfAtivacao, setCpfAtivacao] = useState(cpfInicial);
  const [codigo, setCodigo] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [reenviandoCodigo, setReenviandoCodigo] = useState(false);
  const [aceitarTermos, setAceitarTermos] = useState(false);
  const [mostrarModalTermos, setMostrarModalTermos] = useState(false);

  // ==================== HANDLERS ====================
  
  /**
   * @function handleAtivarConta
   * @description Processa a ativação da conta
   * 
   * Fluxo:
   * 1. Valida CPF, código e aceitação dos termos
   * 2. Chama API ativarConta
   * 3. Se sucesso: exibe mensagem e fecha modal após 2s
   * 4. Se erro: exibe mensagem de erro
   */
  const handleAtivarConta = async () => {
    setModalError('');
    setModalSuccess('');

    if (!cpfAtivacao.trim()) {
      setModalError('Por favor, insira seu CPF');
      return;
    }

    if (!codigo.trim()) {
      setModalError('Por favor, insira o código de ativação');
      return;
    }

    if (!aceitarTermos) {
      setModalError(
        'Você precisa aceitar os termos de uso e política de privacidade',
      );
      return;
    }

    setModalLoading(true);

    try {
      const cpfLimpo = cpfAtivacao.replace(/\D/g, '');

      if (cpfLimpo.length !== 11) {
        throw new Error('CPF deve conter 11 dígitos');
      }

      await ativarConta(cpfLimpo, codigo.trim(), aceitarTermos);

      setModalSuccess(
        'Conta ativada com sucesso! Agora você pode fazer login.',
      );

      setTimeout(() => {
        handleCloseModal();
        setAceitarTermos(false);
      }, 2000);
    } catch (err: unknown) {
      setModalError(
        (err as Error).message ||
          'Código inválido ou expirado. Verifique e tente novamente.',
      );
    } finally {
      setModalLoading(false);
    }
  };

  /**
   * @function handleReenviarCodigo
   * @description Solicita reenvio do código de ativação
   * 
   * Fluxo:
   * 1. Valida CPF
   * 2. Chama API reenviarCodigoAtivacao
   * 3. Exibe mensagem de sucesso/erro
   */
  const handleReenviarCodigo = async () => {
    if (!cpfAtivacao.trim()) {
      setModalError('Por favor, insira seu CPF');
      return;
    }

    setReenviandoCodigo(true);
    setModalError('');
    setModalSuccess('');

    try {
      const cpfLimpo = cpfAtivacao.replace(/\D/g, '');

      if (cpfLimpo.length !== 11) {
        throw new Error('CPF deve conter 11 dígitos');
      }

      const resultado = await reenviarCodigoAtivacao(cpfLimpo);

      if (resultado.valido === true) {
        setModalSuccess(
          resultado.message || 'Novo código enviado para seu email!',
        );
      } else if (resultado.valido === false) {
        setModalError(resultado.message || 'Erro ao solicitar novo código');
      } else {
        setModalSuccess('Código reenviado com sucesso!');
      }
    } catch (err: unknown) {
      setModalError(
        (err as Error).message ||
          'Erro ao solicitar novo código. Tente novamente.',
      );
    } finally {
      setReenviandoCodigo(false);
    }
  };

  /**
   * @function handleCloseModal
   * @description Fecha o modal e reseta todos os estados
   */
  const handleCloseModal = () => {
    setCpfAtivacao('');
    setCodigo('');
    setModalSuccess('');
    setModalError('');
    setAceitarTermos(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseModal();
          } else {
            onOpenChange(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          
          {/* ==================== HEADER ==================== */}
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Key className="w-6 h-6 text-blue-600" />
              Ativar Conta
            </DialogTitle>
            <DialogDescription>
              Insira seu CPF e o código de ativação recebido
            </DialogDescription>
          </DialogHeader>

          {/* ==================== CONTEÚDO ==================== */}
          <div className="space-y-4 py-4">
            
            {/* Mensagem de erro */}
            {modalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{modalError}</span>
              </div>
            )}

            {/* Mensagem de sucesso */}
            {modalSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{modalSuccess}</span>
              </div>
            )}

            {/* Campo CPF */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                CPF
              </label>
              <Input
                type="text"
                value={cpfAtivacao}
                onChange={(e) => {
                  const apenasNumeros = e.target.value.replace(/\D/g, '');
                  if (apenasNumeros.length <= 11) {
                    setCpfAtivacao(apenasNumeros);
                  }
                }}
                placeholder="12345678900"
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                disabled={modalLoading}
                inputMode="numeric"
              />
              <p className="text-xs text-gray-500">
                Digite apenas números, sem pontuações
              </p>
            </div>

            {/* Campo Código com botão de reenvio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Código de Ativação
                </label>
                <button
                  type="button"
                  onClick={handleReenviarCodigo}
                  disabled={reenviandoCodigo || modalLoading}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                >
                  {reenviandoCodigo ? (
                    <>
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3" />
                      <span>Solicitar novo código</span>
                    </>
                  )}
                </button>
              </div>
              <Input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Digite o código recebido"
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all font-mono text-center text-lg"
                disabled={modalLoading}
              />
            </div>

            {/* Checkbox de aceitação dos termos */}
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="termos"
                checked={aceitarTermos}
                onCheckedChange={(checked) => {
                  setAceitarTermos(checked as boolean);
                }}
                disabled={modalLoading}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="termos"
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  Li e aceito os{' '}
                  <button
                    type="button"
                    onClick={() => setMostrarModalTermos(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2 hover:no-underline transition-colors"
                  >
                    Termos de Uso e Política de Privacidade
                  </button>
                </label>
                <p className="text-xs text-gray-500">
                  É necessário aceitar os termos para ativar sua conta
                </p>
              </div>
            </div>
          </div>

          {/* ==================== FOOTER ==================== */}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={modalLoading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAtivarConta}
              disabled={modalLoading || !cpfAtivacao || !codigo}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {modalLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Ativando...</span>
                </div>
              ) : (
                'Ativar Conta'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de termos completos */}
      <ModalTermos
        open={mostrarModalTermos}
        onOpenChange={setMostrarModalTermos}
        onClose={() => setMostrarModalTermos(false)}
      />
    </>
  );
}