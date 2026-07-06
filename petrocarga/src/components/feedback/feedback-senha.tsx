interface FeedbackSenhaProps {
  regras: { mensagem: string; valido: boolean }[];
  forca: { texto: string; nivel: number } | null;
  senha: string;
}

/**
 * @component FeedbackSenha
 * @version 1.0.0
 * 
 * @description Componente de feedback visual para validação de senha.
 * Exibe a força da senha e uma lista de requisitos com status de validação.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {Array} regras - Lista de requisitos de senha
 * @property {string} regras.mensagem - Descrição do requisito
 * @property {boolean} regras.valido - Se o requisito foi atendido
 * 
 * @property {Object | null} forca - Dados de força da senha
 * @property {string} forca.texto - Descrição da força (ex: "Fraca", "Média", "Forte")
 * @property {number} forca.nivel - Nível da força (1, 2 ou 3)
 * 
 * @property {string} senha - Senha atual (controla visibilidade do componente)
 * 
 * ----------------------------------------------------------------------------
 * 🎨 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * - OCULTAÇÃO: Componente só é exibido se senha não estiver vazia
 * 
 * - BARRA DE FORÇA:
 *   - Nível 1 (Fraca): 33% da barra, cor vermelha
 *   - Nível 2 (Média): 66% da barra, cor amarela
 *   - Nível 3 (Forte): 100% da barra, cor verde
 * 
 * - REQUISITOS:
 *   - ✓ (verde): requisito atendido
 *   - ○ (cinza): requisito não atendido
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - ANIMAÇÃO: transition-all duration-500 para barra de força
 * - CORES: Verde (emerald), Amarelo (amber), Vermelho (red)
 * - ICONES: ✓ (check) para válido, ○ (circle) para inválido
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - useValidacaoSenha: Hook que fornece regras e forca
 * 
 * @example
 * ```tsx
 * const { regras, forca, ehValida } = useValidacaoSenha();
 * 
 * return (
 *   <div>
 *     <input
 *       type="password"
 *       value={senha}
 *       onChange={(e) => setSenha(e.target.value)}
 *     />
 *     <FeedbackSenha
 *       regras={regras}
 *       forca={forca}
 *       senha={senha}
 *     />
 *   </div>
 * );
 * ```
 */

export default function FeedbackSenha({
  regras,
  forca,
  senha,
}: FeedbackSenhaProps) {
  // Só exibe o componente se houver senha digitada
  if (senha.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      
      {/* ==================== BARRA DE FORÇA ==================== */}
      {forca && (
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Força da senha</span>
            <span
              className={
                forca.nivel === 1
                  ? 'text-red-500'      // Fraca
                  : forca.nivel === 2
                    ? 'text-amber-500'   // Média
                    : 'text-emerald-500' // Forte
              }
            >
              {forca.texto}
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500
              ${
                forca.nivel === 1
                  ? 'w-1/3 bg-red-500'     // 33% - vermelho
                  : forca.nivel === 2
                    ? 'w-2/3 bg-amber-400'  // 66% - amarelo
                    : 'w-full bg-emerald-500' // 100% - verde
              }`}
            />
          </div>
        </div>
      )}

      {/* ==================== LISTA DE REQUISITOS ==================== */}
      <ul className="space-y-1">
        {regras.map((regra, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span
              className={regra.valido ? 'text-emerald-500' : 'text-gray-400'}
            >
              {regra.valido ? '✓' : '○'}
            </span>
            <span className={regra.valido ? 'text-gray-600' : 'text-gray-400'}>
              {regra.mensagem}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}