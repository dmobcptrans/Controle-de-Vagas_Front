import { Label } from '@/components/ui/label';
import { CircleAlert } from 'lucide-react';

interface FormItemProps {
  children: React.ReactNode;
  name: string;
  description: string;
  error?: string;
}

/**
 * @component FormItem
 * @version 1.0.0
 * 
 * @description Componente de layout para campos de formulário.
 * Organiza label, descrição e input com layout responsivo e exibição de erros.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {React.ReactNode} children - Conteúdo do campo (input, select, etc.)
 * @property {string} name - Nome/label do campo
 * @property {string} description - Descrição/texto de ajuda do campo
 * @property {string} [error] - Mensagem de erro (opcional)
 * 
 * ----------------------------------------------------------------------------
 * 🎨 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * - LAYOUT RESPONSIVO:
 *   - Mobile: label acima do input (flex-col)
 *   - Desktop: label ao lado do input (flex-row)
 * 
 * - ERRO:
 *   - Ícone de alerta (CircleAlert) ao lado do label
 *   - Mensagem de erro abaixo do input
 *   - Cor vermelha (text-red-500)
 * 
 * - SEPARADOR: Borda inferior entre os campos (border-b border-gray-200)
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - LARGURA FIXA: label ocupa md:w-64 no desktop
 * - FLEX: children ocupa espaço restante (flex-1)
 * - ESPAÇAMENTO: gap-3 mobile, gap-6 desktop
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - Label: Componente de label do shadcn/ui
 * - CircleAlert: Ícone de alerta do Lucide
 * 
 * @example
 * ```tsx
 * <FormItem
 *   name="Nome"
 *   description="Insira seu nome completo"
 *   error={errors.nome}
 * >
 *   <Input
 *     name="nome"
 *     placeholder="João Silva"
 *     value={nome}
 *     onChange={(e) => setNome(e.target.value)}
 *   />
 * </FormItem>
 * ```
 */

export default function FormItem({
  children,
  name,
  description,
  error,
}: FormItemProps) {
  return (
    <div className="space-y-3 md:space-y-0 flex flex-col md:flex-row md:items-start gap-3 md:gap-6 py-4 md:py-6 border-b border-b-gray-200">
      
      {/* ==================== LABEL E DESCRIÇÃO ==================== */}
      <div className="md:w-64 md:flex-shrink-0">
        <Label className="block">
          <div className="flex items-center gap-2">
            <p className="text-gray-800 font-medium text-sm md:text-base mb-1">
              {name}
            </p>
            {/* Ícone de erro ao lado do label */}
            {error && (
              <CircleAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-muted-foreground text-xs md:text-sm font-normal leading-relaxed">
            {description}
          </p>
        </Label>
      </div>

      {/* ==================== CONTEÚDO DO CAMPO ==================== */}
      <div className="flex-1 w-full space-y-2">
        {children}
        
        {/* Mensagem de erro abaixo do input */}
        {error && (
          <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
            <CircleAlert className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}