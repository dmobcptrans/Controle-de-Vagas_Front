'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Key, RefreshCw, X } from 'lucide-react';
import {
  ativarConta,
  reenviarCodigoAtivacao,
} from '@/services/api/recuperacaoApi';

type TipoConta = 'empresa' | 'motorista';
type TipoModal = TipoConta | 'generico';

interface ModalAtivacaoContaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  documentoInicial?: string;
  tipo: TipoModal;
}

/**
 * @component ModalAtivacaoConta
 * @version 1.3.0
 *
 * @description Modal para ativação de conta de usuário.
 * Suporta três fluxos, alternados pela prop `tipo`:
 *  - 'motorista' → documento é CPF (11 dígitos)
 *  - 'empresa'   → documento é CNPJ (14 dígitos)
 *  - 'generico'  → documento pode ser CPF OU CNPJ; o tipo é detectado
 *                  automaticamente pela quantidade de dígitos digitados
 *                  (11 = CPF/motorista, 14 = CNPJ/empresa) e o tipo
 *                  correto é enviado para a API
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. ATIVAÇÃO DE CONTA:
 *    - Usuário insere CPF ou CNPJ (apenas números)
 *      - Se `tipo` for 'empresa' ou 'motorista', o formato é fixo
 *      - Se `tipo` for 'generico', o componente detecta automaticamente
 *        se é CPF (11 dígitos) ou CNPJ (14 dígitos)
 *    - Usuário insere código de ativação (recebido por email)
 *    - Aceitação dos termos é enviada automaticamente como `true`
 *    - Clique em "Ativar Conta" → chama API ativarConta(tipoDetectado, documento, codigo)
 *
 * 2. REENVIO DE CÓDIGO:
 *    - Usuário pode solicitar novo código via botão "Solicitar novo código"
 *    - Valida documento antes do envio (incluindo detecção automática no modo genérico)
 *    - Feedback visual com loading spinner
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - MÁSCARA DOCUMENTO: Apenas números.
 *   - 'motorista' → máximo 11 dígitos (CPF)
 *   - 'empresa'   → máximo 14 dígitos (CNPJ)
 *   - 'generico'  → máximo 14 dígitos (aceita CPF ou CNPJ); o tipo real
 *                   é derivado da quantidade de dígitos no momento do envio
 * - DETECÇÃO AUTOMÁTICA (modo 'generico'): 11 dígitos → 'motorista' (CPF),
 *   14 dígitos → 'empresa' (CNPJ). Quantidades diferentes de 11 ou 14 são
 *   inválidas e bloqueiam o envio.
 * - TERMOS: Não há mais checkbox de aceite; a aceitação é considerada
 *   implícita e enviada automaticamente como `true` ao ativar a conta
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
 * - ativarConta, reenviarCodigoAtivacao: APIs de ativação
 *
 * @example
 * ```tsx
 * // Fluxo genérico: detecta automaticamente CPF ou CNPJ
 * <ModalAtivacaoConta
 *   open={mostrarModal}
 *   onOpenChange={setMostrarModal}
 *   onClose={handleCloseModal}
 *   tipo="generico"
 * />
 * ```
 */

export default function ModalAtivacaoConta({
  open,
  onOpenChange,
  onClose,
  documentoInicial = '',
  tipo,
}: ModalAtivacaoContaProps) {
  // ==================== CONFIG POR TIPO ====================
  const isGenerico = tipo === 'generico';
  const isEmpresa = tipo === 'empresa';

  const labelDocumento = isGenerico ? 'CPF/CNPJ' : isEmpresa ? 'CNPJ' : 'CPF';

  // No modo genérico permitimos até 14 dígitos (tamanho do CNPJ),
  // já que o usuário pode estar digitando um CPF (11) ou um CNPJ (14).
  const tamanhoDocumento = isGenerico ? 14 : isEmpresa ? 14 : 11;
  const placeholderDocumento = isGenerico
    ? '12345678900 ou 12345678000190'
    : isEmpresa
      ? '12345678000190'
      : '12345678900';

  /**
   * @function detectarTipoDocumento
   * @description No modo 'generico', identifica se o documento informado
   * é um CPF (11 dígitos → 'motorista') ou um CNPJ (14 dígitos → 'empresa')
   * com base na quantidade de dígitos. Retorna `null` se a quantidade de
   * dígitos não corresponder a nenhum dos dois formatos.
   */
  const detectarTipoDocumento = (doc: string): TipoConta | null => {
    if (doc.length === 11) return 'motorista';
    if (doc.length === 14) return 'empresa';
    return null;
  };

  // ==================== ESTADOS ====================
  const [documento, setDocumento] = useState(documentoInicial);
  const [codigo, setCodigo] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [reenviandoCodigo, setReenviandoCodigo] = useState(false);
  const router = useRouter();
  // Tipo efetivo (usado apenas para exibição/feedback em tempo real
  // no modo genérico; a validação "de verdade" ocorre nos handlers)
  const tipoDetectadoAtual = useMemo(() => {
    if (!isGenerico) return tipo as TipoConta;
    return detectarTipoDocumento(documento.replace(/\D/g, ''));
  }, [documento, isGenerico, tipo]);

  // ==================== HANDLERS ====================

  /**
   * @function resolverTipoEValidar
   * @description Resolve o tipo de conta (empresa/motorista) a partir da
   * prop `tipo` e do documento digitado, validando o tamanho conforme o
   * modo (fixo ou genérico). Retorna o tipo resolvido e o documento limpo,
   * ou `null` se a validação falhar (já exibindo o toast de erro).
   */
  const resolverTipoEValidar = (): {
    tipoReal: TipoConta;
    documentoLimpo: string;
  } | null => {
    const documentoLimpo = documento.replace(/\D/g, '');

    if (!documentoLimpo) {
      toast.error(`Por favor, insira seu ${labelDocumento}`);
      return null;
    }

    if (isGenerico) {
      const tipoReal = detectarTipoDocumento(documentoLimpo);

      if (!tipoReal) {
        toast.error(
          'Informe um CPF (11 dígitos) ou um CNPJ (14 dígitos) válido',
        );
        return null;
      }

      return { tipoReal, documentoLimpo };
    }

    if (documentoLimpo.length !== tamanhoDocumento) {
      toast.error(
        `${labelDocumento} deve conter exatamente ${tamanhoDocumento} dígitos`,
      );
      return null;
    }

    return { tipoReal: tipo as TipoConta, documentoLimpo };
  };

  /**
   * @function handleAtivarConta
   * @description Processa a ativação da conta
   *
   * Fluxo:
   * 1. Resolve e valida o tipo (fixo ou detectado automaticamente) e o documento
   * 2. Valida o código
   * 3. Chama API ativarConta (aceite dos termos enviado automaticamente como true)
   * 4. Se sucesso: exibe mensagem e fecha modal
   * 5. Se erro: exibe mensagem de erro
   */
  const handleAtivarConta = async () => {
    const resolvido = resolverTipoEValidar();
    if (!resolvido) return;

    const { tipoReal, documentoLimpo } = resolvido;

    if (!codigo.trim()) {
      toast.error('Por favor, insira o código de ativação');
      return;
    }

    setModalLoading(true);

    try {
      await ativarConta(tipoReal, documentoLimpo, codigo.trim());

      toast.success('Conta ativada com sucesso! Agora você pode fazer login.');

      handleCloseModal();
      router.push('/autorizacao/login');
    } catch (err: unknown) {
      toast.error(
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
   * 1. Resolve e valida o tipo (fixo ou detectado automaticamente) e o documento
   * 2. Chama API reenviarCodigoAtivacao
   * 3. Exibe mensagem de sucesso/erro
   */
  const handleReenviarCodigo = async () => {
    const resolvido = resolverTipoEValidar();
    if (!resolvido) return;

    const { tipoReal, documentoLimpo } = resolvido;

    setReenviandoCodigo(true);

    try {
      const resultado = await reenviarCodigoAtivacao(tipoReal, documentoLimpo);

      if (resultado.valido === true) {
        toast.success(
          resultado.message || 'Novo código enviado para seu e-mail!',
        );
      } else if (resultado.valido === false) {
        toast.error(resultado.message || 'Erro ao solicitar novo código');
      } else {
        toast.success('Código reenviado com sucesso!');
      }
    } catch (err: unknown) {
      toast.error(
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
    setDocumento('');
    setCodigo('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          onOpenChange(true);
        }
      }}
    >
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="
    fixed
    bottom-0
    top-auto
    left-[50%]
    z-50
    w-full
    max-w-full
    translate-x-[-50%]
    translate-y-0
    border-none
    bg-white
    p-0
    shadow-2xl
    overflow-hidden
    rounded-4xl
    rounded-b-none

    sm:bottom-auto
    sm:top-[50%]
    sm:translate-y-[-50%]
    sm:max-w-md
    sm:rounded-3xl

    data-[state=open]:animate-in
    data-[state=closed]:animate-out
    data-[state=closed]:fade-out-0
    data-[state=open]:fade-in-0
    data-[state=closed]:slide-out-to-bottom
    data-[state=open]:slide-in-from-bottom
    sm:data-[state=closed]:zoom-out-95
    sm:data-[state=open]:zoom-in-95

    [&>button]:hidden
  "
      >
        {/* ================= HEADER ================= */}
        <div className="relative bg-blue-800 px-6 pt-6 pb-7 text-white">
          {/* Botão Fechar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCloseModal}
            disabled={modalLoading}
            className="
      absolute
      right-5
      top-5
      h-11
      w-11
      rounded-2xl
      bg-white/10
      text-white
      backdrop-blur-md
      border
      border-white/10
      hover:bg-white
      hover:text-blue-900
      transition-all
    "
          >
            <X className="h-5 w-5" strokeWidth={3} />
          </Button>

          <DialogHeader>
            <div className="flex items-start gap-4 pr-14">
              <div className="flex-1 text-left">
                <DialogTitle className="text-2xl font-bold leading-tight tracking-tight">
                  Ativar Conta
                </DialogTitle>

                <DialogDescription className="mt-2 max-w-xs text-sm leading-relaxed text-blue-200/80">
                  Informe seu <strong>{labelDocumento}</strong> e o código de
                  ativação.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* ================= CONTEÚDO ================= */}
        <div className="space-y-6 px-6 py-6 bg-white">
          {/* Documento */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 tracking-wide">
              {labelDocumento}
            </label>

            <Input
              type="text"
              value={documento}
              onChange={(e) => {
                const apenasNumeros = e.target.value.replace(/\D/g, '');
                if (apenasNumeros.length <= tamanhoDocumento) {
                  setDocumento(apenasNumeros);
                }
              }}
              placeholder={placeholderDocumento}
              disabled={modalLoading}
              inputMode="numeric"
              className="
              h-14
              rounded-2xl
              border-slate-200
              bg-slate-50/50
              px-4
              text-base
              transition-all
              placeholder:text-slate-400
              focus:bg-white
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
            "
            />

            {isGenerico ? (
              <p className="text-xs text-slate-400 font-medium pl-1">
                Digite apenas os números. CPF (11 dígitos) ou CNPJ (14 dígitos).
                {tipoDetectadoAtual && (
                  <span className="ml-1 font-semibold text-blue-600">
                    Detectado:{' '}
                    {tipoDetectadoAtual === 'empresa' ? 'CNPJ' : 'CPF'}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-xs text-slate-400 font-medium pl-1">
                Digite apenas os números ({tamanhoDocumento} dígitos).
              </p>
            )}
          </div>

          {/* Código */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 tracking-wide">
                Código de Ativação
              </label>

              <button
                type="button"
                onClick={handleReenviarCodigo}
                disabled={reenviandoCodigo || modalLoading}
                className="
                flex
                items-center
                gap-1.5
                text-sm
                font-bold
                text-blue-600
                transition-all
                hover:text-blue-700
                active:scale-95
                disabled:opacity-50
                disabled:pointer-events-none
              "
              >
                {reenviandoCodigo ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <span className="text-slate-400">Enviando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reenviar</span>
                  </>
                )}
              </button>
            </div>

            <Input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="••••••"
              disabled={modalLoading}
              className="
              h-14
              rounded-2xl
              border-slate-200
              bg-slate-50/50
              text-center
              text-xl
              font-mono
              tracking-[0.25em]
              transition-all
              placeholder:text-slate-300
              placeholder:tracking-normal
              focus:bg-white
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
            "
            />
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <DialogFooter
          className="
          flex 
          flex-col-reverse 
          gap-3 
          border-t 
          border-slate-100 
          bg-slate-50/50 
          px-6 
          py-5 
          
          /* Ajustes de layout desktop */
          sm:flex-row 
          sm:bg-white
        "
        >
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseModal}
            disabled={modalLoading}
            className="
            h-13
            w-full
            rounded-2xl
            border-slate-200
            text-slate-600
            font-semibold
            bg-white
            hover:bg-slate-50
            active:scale-[0.99]
            transition-all
            sm:flex-1
            sm:h-12
          "
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleAtivarConta}
            disabled={modalLoading || !documento || !codigo}
            className="
            h-13
            w-full
            rounded-2xl
            bg-blue-600
            text-white
            font-semibold
            shadow-md
            shadow-blue-600/10
            hover:bg-blue-700
            active:scale-[0.99]
            transition-all
            disabled:opacity-50
            disabled:pointer-events-none
            sm:flex-1
            sm:h-12
          "
          >
            {modalLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Ativando...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Key className="h-4 w-4" />
                <span>Ativar Conta</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
