import { ReservaPlaca } from '@/lib/types/reservaPlaca';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User, Car } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReservaPlacaCardProps {
  reserva: ReservaPlaca;
}

/**
 * @component ReservaPlacaCard
 * @version 1.0.0
 *
 * @description Card de exibição de reserva para consulta por placa.
 * Exibe todas as informações relevantes da reserva em um formato compacto e organizado.
 *
 * ----------------------------------------------------------------------------
 * 📋 INFORMAÇÕES EXIBIDAS:
 * ----------------------------------------------------------------------------
 *
 * 1. HEADER:
 *    - Nome do motorista (título)
 *    - Badge com status colorido
 *
 * 2. VEÍCULO:
 *    - Marca e modelo
 *    - Placa
 *    - Tamanho em metros
 *
 * 3. LOCALIZAÇÃO DA VAGA:
 *    - Logradouro e número
 *    - Bairro
 *    - Referência (se houver)
 *
 * 4. DATAS:
 *    - Início (data e hora)
 *    - Fim (data e hora)
 *
 * 5. MOTORISTA E CRIAÇÃO:
 *    - Nome do motorista
 *    - Quem criou a reserva (se disponível)
 *
 * 6. RODAPÉ:
 *    - Código PMP da vaga
 *    - Data de criação da reserva
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - getStatusColor: Função que retorna classes Tailwind baseadas no status
 *   - ATIVA: verde
 *   - RESERVADA: azul
 *   - Outros: cinza (fallback)
 *
 * - formatDate: Formatação de datas com date-fns e locale pt-BR
 *   - Fallback para string original se a data for inválida
 *   - Formato: "dd/MM/yyyy 'às' HH:mm"
 *
 * - LAYOUT RESPONSIVO:
 *   - Datas em grid: 1 coluna (mobile) / 2 colunas (md+)
 *   - Ícones fixos à esquerda para alinhamento visual
 *
 * - TRATAMENTO DE DADOS OPCIONAIS:
 *   - `reserva.referenciaEndereco` só é exibido se existir
 *   - `reserva.criadoPor` só é exibido se existir
 *
 * ----------------------------------------------------------------------------
 * 🎨 CORES DOS STATUS:
 * ----------------------------------------------------------------------------
 *
 * | Status     | Cor           | Uso                          |
 * |------------|---------------|------------------------------|
 * | ATIVA      | 🟢 Verde      | Reserva em andamento         |
 * | RESERVADA  | 🔵 Azul       | Reserva agendada             |
 * | Outros     | ⚪ Cinza      | Finalizada, cancelada, etc.  |
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - Badge: Componente de status
 * - Card: Container principal
 * - Lucide icons: Ícones visuais
 * - date-fns: Formatação de datas
 *
 * @example
 * ```tsx
 * <ReservaPlacaCard reserva={reserva} />
 * ```
 *
 * @see /src/lib/types/reservaPlaca.ts - Tipo ReservaPlaca
 */

export default function ReservaPlacaCard({ reserva }: ReservaPlacaCardProps) {
  /**
   * @function getStatusColor
   * @description Retorna classes CSS baseadas no status da reserva
   * @param status - Status da reserva
   * @returns Classes Tailwind para cor de fundo, texto e borda
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVA':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RESERVADA':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * @function formatDate
   * @description Formata data ISO para o padrão brasileiro
   * @param dateString - Data em formato ISO string
   * @returns Data formatada (dd/MM/yyyy 'às' HH:mm) ou string original se inválida
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="w-full overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200">
      {/* ==================== HEADER ==================== */}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-800 truncate">
            {reserva.motoristaNome}
          </CardTitle>
          <Badge className={`font-medium ${getStatusColor(reserva.status)}`}>
            {reserva.status}
          </Badge>
        </div>
      </CardHeader>

      {/* ==================== CONTEÚDO ==================== */}
      <CardContent className="space-y-4">
        {/* Seção: Veículo */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">Veículo</p>
              <p className="font-semibold text-gray-900">
                {reserva.marcaVeiculo} {reserva.modeloVeiculo}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-gray-600">
                  <strong>Placa:</strong> {reserva.placaVeiculo}
                </span>
                <span className="text-sm text-gray-600">
                  <strong>Tamanho:</strong> {reserva.tamanhoVeiculo}m
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Seção: Localização da Vaga */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">Local da Vaga</p>
              <p className="text-sm text-gray-900">
                {reserva.enderecoVaga.logradouro}, {reserva.numeroEndereco}
              </p>
              <p className="text-sm text-gray-600">
                {reserva.enderecoVaga.bairro}
              </p>
              {/* Referência (opcional) */}
              {reserva.referenciaEndereco && (
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Referência:</span>{' '}
                  {reserva.referenciaEndereco}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Seção: Datas (grid responsivo) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Início</p>
              <p className="text-sm text-gray-900">
                {formatDate(reserva.inicio)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Fim</p>
              <p className="text-sm text-gray-900">{formatDate(reserva.fim)}</p>
            </div>
          </div>
        </div>

        {/* Seção: Informações do Motorista e Criação */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          {/* Motorista (proprietário da reserva) */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">Motorista</p>
              <p className="text-sm text-gray-900">{reserva.motoristaNome}</p>
            </div>
          </div>

          {/* Criador da reserva (opcional - pode ser agente/gestor) */}
          {reserva.criadoPor && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Criado por</p>
                <p className="text-sm text-gray-900">
                  {reserva.criadoPor.nome}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com metadados */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            <strong>Código PMP:</strong> {reserva.enderecoVaga.codigoPmp}
          </p>
          <p className="text-xs text-gray-500">
            <strong>Criado em:</strong> {formatDate(reserva.criadoEm)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
