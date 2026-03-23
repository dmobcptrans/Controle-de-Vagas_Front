'use client';

import { CheckCircle2 } from 'lucide-react';

interface ModalSucessoEnvioProps {
  tipoInput: 'email' | 'cpf' | 'indeterminado';
  onVoltarLogin: () => void;
  onTentarOutro: () => void;
}

/**
 * @component ModalSucessoEnvio
 * @version 1.0.0
 * 
 * @description Modal de sucesso exibido após o envio do código de recuperação/ativação.
 * Informa o usuário sobre o envio e oferece opções de navegação.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {'email' | 'cpf' | 'indeterminado'} tipoInput - Tipo do identificador usado na solicitação
 * @property {() => void} onVoltarLogin - Função para voltar para página de login
 * @property {() => void} onTentarOutro - Função para tentar com outro identificador
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. MENSAGEM PERSONALIZADA:
 *    - Adapta o texto baseado no tipo de identificador (email ou CPF)
 *    - Exemplo: "Se este email estiver cadastrado..." ou "Se este CPF estiver cadastrado..."
 * 
 * 2. BOTÕES DE AÇÃO:
 *    - "Voltar para o login": Redireciona para página de login
 *    - "Tentar outro [email/CPF]": Permite nova tentativa com outro identificador
 * 
 * 3. INFORMAÇÕES ADICIONAIS:
 *    - Orienta o usuário a verificar caixa de entrada e spam
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - TEXTO DINÂMICO: Mensagens adaptadas conforme tipoInput
 * - DOIS BOTÕES: Principal (login) e secundário (tentar outro)
 * - ÍCONE: CheckCircle2 verde em círculo verde claro
 * - SEM BACKDROP: Modal não tem fundo escuro (é integrado ao componente pai)
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - CheckCircle2: Ícone de sucesso do Lucide
 * 
 * @example
 * ```tsx
 * // Sucesso após solicitação com email
 * <ModalSucessoEnvio
 *   tipoInput="email"
 *   onVoltarLogin={() => router.push('/login')}
 *   onTentarOutro={() => setCodigoEnviado(false)}
 * />
 * 
 * // Sucesso após solicitação com CPF
 * <ModalSucessoEnvio
 *   tipoInput="cpf"
 *   onVoltarLogin={() => router.push('/login')}
 *   onTentarOutro={() => setCodigoEnviado(false)}
 * />
 * ```
 */

export default function ModalSucessoEnvio({
  tipoInput,
  onVoltarLogin,
  onTentarOutro,
}: ModalSucessoEnvioProps) {
  return (
    <div className="text-center space-y-4 sm:space-y-6">
      
      {/* ==================== ÍCONE DE SUCESSO ==================== */}
      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full">
        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-600" />
      </div>

      {/* ==================== MENSAGENS ==================== */}
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
          Solicitação recebida!
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-2">
          Se este {tipoInput === 'email' ? 'email' : 'CPF'} estiver cadastrado,
          você receberá um código em instantes.
        </p>
        <p className="text-xs sm:text-sm text-gray-500">
          Verifique sua caixa de entrada e também a pasta de spam.
        </p>
      </div>

      {/* ==================== BOTÕES ==================== */}
      <div className="space-y-2 sm:space-y-3">
        
        {/* Botão principal - Voltar para login */}
        <button
          onClick={onVoltarLogin}
          className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-indigo-700 transition"
        >
          Voltar para o login
        </button>
        
        {/* Botão secundário - Tentar outro identificador */}
        <button
          onClick={onTentarOutro}
          className="w-full bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-200 transition"
        >
          Tentar outro {tipoInput === 'email' ? 'email' : 'CPF'}
        </button>
      </div>
    </div>
  );
}