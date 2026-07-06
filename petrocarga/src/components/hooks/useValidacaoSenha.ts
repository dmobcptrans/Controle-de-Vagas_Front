'use client';

import { useState } from 'react';

interface Regra {
  mensagem: string;
  valido: boolean;
}

interface Forca {
  texto: string;
  nivel: number;
}

interface RetornoValidacaoSenha {
  senha: string;
  setSenha: (senha: string) => void;
  regras: Regra[];
  erros: string[];
  ehValida: boolean;
  forca: Forca | null;
}

/**
 * Lista de regras para validação de senha
 * Cada regra possui uma mensagem e uma função de teste
 */
const REGRAS_SENHA = [
  { mensagem: 'Mínimo de 6 caracteres', teste: (s: string) => s.length >= 6 },
  {
    mensagem: 'Pelo menos uma letra minúscula',
    teste: (s: string) => /[a-z]/.test(s),
  },
  {
    mensagem: 'Pelo menos uma letra maiúscula',
    teste: (s: string) => /[A-Z]/.test(s),
  },
  { mensagem: 'Pelo menos um número', teste: (s: string) => /\d/.test(s) },
  {
    mensagem: 'Pelo menos um caractere especial (!@#...)',
    teste: (s: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(s),
  },
];

/**
 * @function obterForcaSenha
 * @description Calcula a força da senha baseado em múltiplos critérios
 * 
 * @param senha - A senha a ser avaliada
 * @returns Objeto com texto e nível (1=fraca, 2=moderada, 3=forte) ou null se vazia
 * 
 * Critérios de pontuação:
 * - 1 ponto: >= 6 caracteres
 * - 1 ponto: >= 10 caracteres
 * - 1 ponto: contém letra minúscula
 * - 1 ponto: contém letra maiúscula
 * - 1 ponto: contém número
 * - 1 ponto: contém caractere especial
 * - 1 ponto: >= 14 caracteres
 * 
 * Classificação:
 * - ≤ 2 pontos: Fraca (nível 1)
 * - ≤ 4 pontos: Moderada (nível 2)
 * - > 4 pontos: Forte (nível 3)
 */
const obterForcaSenha = (senha: string): Forca | null => {
  if (senha.length === 0) return null;

  let pontuacao = 0;

  // Critérios de pontuação
  if (senha.length >= 6) pontuacao++;
  if (senha.length >= 10) pontuacao++;
  if (/[a-z]/.test(senha)) pontuacao++;
  if (/[A-Z]/.test(senha)) pontuacao++;
  if (/\d/.test(senha)) pontuacao++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)) pontuacao++;
  if (senha.length >= 14) pontuacao++;

  // Classificação
  if (pontuacao <= 2) return { texto: 'Fraca', nivel: 1 };
  if (pontuacao <= 4) return { texto: 'Moderada', nivel: 2 };
  return { texto: 'Forte', nivel: 3 };
};

/**
 * @hook useValidacaoSenha
 * @version 1.0.0
 * 
 * @description Hook customizado para validação de senha em tempo real.
 * Fornece regras, erros, força da senha e indicador de validade.
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO:
 * ----------------------------------------------------------------------------
 * 
 * @property {string} senha - Valor atual da senha
 * @property {(senha: string) => void} setSenha - Função para atualizar a senha
 * @property {Regra[]} regras - Lista de regras com status de validação
 * @property {string[]} erros - Lista de mensagens de erro (regras não atendidas)
 * @property {boolean} ehValida - Indica se a senha atende a todas as regras
 * @property {Forca | null} forca - Nível de força da senha (null se vazia)
 * 
 * ----------------------------------------------------------------------------
 * 📋 REGRAS DE VALIDAÇÃO:
 * ----------------------------------------------------------------------------
 * 
 * 1. Mínimo de 6 caracteres
 * 2. Pelo menos uma letra minúscula
 * 3. Pelo menos uma letra maiúscula
 * 4. Pelo menos um número
 * 5. Pelo menos um caractere especial (!@#...)
 * 
 * ----------------------------------------------------------------------------
 * 📋 NÍVEIS DE FORÇA:
 * ----------------------------------------------------------------------------
 * 
 * | Nível | Texto     | Pontuação | Cor Sugerida |
 * |-------|-----------|-----------|--------------|
 * | 1     | Fraca     | ≤ 2       | 🔴 Vermelho  |
 * | 2     | Moderada  | 3-4       | 🟡 Amarelo    |
 * | 3     | Forte     | ≥ 5       | 🟢 Verde      |
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - VALIDAÇÃO EM TEMPO REAL: Recalcula regras a cada mudança de senha
 * - REGRAS DECLARATIVAS: Array de regras para fácil manutenção
 * - PONTUAÇÃO MÚLTIPLA: Sistema de pontuação para classificação de força
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - FeedbackSenha: Componente visual que exibe regras e força
 * 
 * @example
 * ```tsx
 * function SenhaInput() {
 *   const { senha, setSenha, regras, ehValida, forca } = useValidacaoSenha();
 * 
 *   return (
 *     <div>
 *       <input
 *         type="password"
 *         value={senha}
 *         onChange={(e) => setSenha(e.target.value)}
 *         className={!ehValida && senha ? 'border-red-500' : ''}
 *       />
 *       <FeedbackSenha regras={regras} forca={forca} senha={senha} />
 *     </div>
 *   );
 * }
 * ```
 */

const useValidacaoSenha = (): RetornoValidacaoSenha => {
  const [senha, setSenha] = useState('');

  // Calcula status de cada regra
  const regras = REGRAS_SENHA.map((r) => ({
    mensagem: r.mensagem,
    valido: r.teste(senha),
  }));
  
  // Extrai mensagens de erro
  const erros = regras.filter((r) => !r.valido).map((r) => r.mensagem);
  
  // Verifica se todas as regras foram atendidas
  const ehValida = erros.length === 0;
  
  // Calcula força da senha
  const forca = obterForcaSenha(senha);

  return { senha, setSenha, regras, erros, ehValida, forca };
};

export default useValidacaoSenha;