import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Pencil,
  Save,
  Loader2,
} from 'lucide-react';
import { Veiculo } from '@/lib/types/veiculo';
import { Vaga } from '@/lib/types/vaga';

interface ReservaSummaryProps {
  form: {
    inicio: string;
    fim: string;
    cidadeOrigem: string;
  };
  initialForm: {
    inicio: string;
    fim: string;
    cidadeOrigem: string;
  };
  veiculo: Veiculo | null;
  initialVeiculoId: string | null;
  vaga: Vaga | null;
  isSaving: boolean;
  onEditVehicle: () => void;
  onEditTime: () => void;
  onSave: () => void;
  hasUser: boolean;
}

export function ReservaSummary({
  form,
  initialForm,
  veiculo,
  initialVeiculoId,
  vaga,
  isSaving,
  onEditVehicle,
  onEditTime,
  onSave,
  hasUser,
}: ReservaSummaryProps) {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'long',
    });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

  /* =====================
     DETECTA ALTERAÇÕES
  ====================== */
  const hasChanges =
    form.inicio !== initialForm.inicio ||
    form.fim !== initialForm.fim ||
    form.cidadeOrigem !== initialForm.cidadeOrigem ||
    veiculo?.id !== initialVeiculoId;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Card Veículo / Origem */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 flex justify-between gap-4 hover:border-gray-200 transition">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-900 font-medium">
            <Car size={18} className="text-blue-500" />
            <h3>Veículo e origem</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Veículo</p>
              <p className="text-gray-800 font-medium">
                {veiculo
                  ? `${veiculo.modelo} • ${veiculo.placa}`
                  : 'Carregando…'}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Origem</p>
              <div className="flex items-center gap-1 text-gray-800 font-medium">
                <MapPin size={14} className="text-gray-400" />
                <span>{form.cidadeOrigem}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onEditVehicle}
          className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition"
        >
          <Pencil size={16} />
        </button>
      </div>

      {/* Card Horário */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 flex justify-between gap-4 hover:border-gray-200 transition">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-900 font-medium">
            <Clock size={18} className="text-indigo-500" />
            <h3>Horário</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-800">
            <Calendar size={16} className="text-gray-400" />
            <span className="capitalize">{formatDate(form.inicio)}</span>
            <span className="text-gray-400">•</span>
            <span className="font-medium">
              {formatTime(form.inicio)} – {formatTime(form.fim)}
            </span>
          </div>
        </div>

        <button
          disabled={!vaga}
          onClick={onEditTime}
          className={`shrink-0 h-9 w-9 flex items-center justify-center rounded-full transition ${
            !vaga
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'
          }`}
        >
          <Pencil size={16} />
        </button>
      </div>

      {/* Botão Salvar — só aparece se houve alteração */}
      {hasChanges && (
        <div className="pt-6 animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={onSave}
            disabled={isSaving || !hasUser}
            className={`
              w-full h-11 rounded-xl font-medium text-white
              flex items-center justify-center gap-2
              transition active:scale-[0.98]
              ${
                isSaving || !hasUser
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            `}
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Salvando…
              </>
            ) : (
              <>
                <Save size={18} />
                Salvar alterações
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
