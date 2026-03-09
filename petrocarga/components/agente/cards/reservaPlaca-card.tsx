import { ReservaPlaca } from '@/lib/types/reservaPlaca';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User, Car } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReservaPlacaCardProps {
  reserva: ReservaPlaca;
}

export default function ReservaPlacaCard({ reserva }: ReservaPlacaCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVA':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RESERVADA':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FINALIZADA':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

      <CardContent className="space-y-4">
        {/* Informações do Veículo */}
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

        {/* Localização da Vaga */}
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
              {reserva.referenciaEndereco && (
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Referência:</span>{' '}
                  {reserva.referenciaEndereco}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Datas */}
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

        {/* Informações do Motorista */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">Motorista</p>
              <p className="text-sm text-gray-900">{reserva.motoristaNome}</p>
            </div>
          </div>
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

        {/* Código PMP */}
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
