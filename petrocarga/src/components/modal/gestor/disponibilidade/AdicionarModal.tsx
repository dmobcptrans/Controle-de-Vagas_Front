import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Vaga } from '@/lib/types/vaga';

interface AdicionarModalProps {
  open: boolean;
  onClose: () => void;
  vagasPorLogradouro: Record<string, Vaga[]>;
  dataInicialPredefinida?: string | null;
  onSalvar: (data: {
    inicio: string;
    fim: string;
    modo: 'logradouro' | 'personalizado';
    selecionados: string[];
  }) => void;
}

/**
 * @component AdicionarModal
 * @version 1.0.0
 * 
 * @description Modal para adicionar disponibilidade de vagas.
 * Permite selecionar vagas por logradouro ou personalizado, e definir período.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {boolean} open - Controla a visibilidade do modal
 * @property {() => void} onClose - Função para fechar o modal
 * @property {Record<string, Vaga[]>} vagasPorLogradouro - Vagas agrupadas por logradouro
 * @property {string | null} [dataInicialPredefinida] - Data pré-definida para início
 * @property {(data: { inicio, fim, modo, selecionados }) => void} onSalvar - Callback ao salvar
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. MODOS DE SELEÇÃO:
 *    - Por Logradouro: seleciona todas vagas de um logradouro
 *    - Personalizado: seleciona vagas individualmente
 * 
 * 2. DATA PRÉ-DEFINIDA:
 *    - Se fornecida, define data de início automaticamente
 *    - Calcula data de fim como início + 4 dias
 * 
 * 3. SELEÇÃO:
 *    - Checkboxes para selecionar logradouros ou vagas
 *    - Estado local gerencia os selecionados
 * 
 * 4. SALVAMENTO:
 *    - Envia dados formatados (datas com horários)
 *    - Limpa seleção após salvar
 *    - Fecha modal
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - MODO: logradouro (IDs das vagas) vs personalizado (IDs das vagas)
 * - DATA PRÉ-DEFINIDA: inicia com data selecionada + 4 dias
 * - FORMATO: datass enviadas como "YYYY-MM-DDT00:00" e "YYYY-MM-DDT23:59"
 * - CLEANUP: Limpa seleção após salvar
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - Dialog: Componente de modal do shadcn/ui
 * - Checkbox: Componente de checkbox
 * - Vaga: Tipo de vaga
 * 
 * @example
 * ```tsx
 * <AdicionarModal
 *   open={showModal}
 *   onClose={() => setShowModal(false)}
 *   vagasPorLogradouro={vagasPorLogradouro}
 *   dataInicialPredefinida="2024-01-15"
 *   onSalvar={handleSalvar}
 * />
 * ```
 */

export function AdicionarModal({
  open,
  onClose,
  vagasPorLogradouro,
  dataInicialPredefinida,
  onSalvar,
}: AdicionarModalProps) {
  const [modo, setModo] = useState<'logradouro' | 'personalizado'>(
    'logradouro',
  );
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');

  // ==================== DATA PRÉ-DEFINIDA ====================
  useEffect(() => {
    if (open && dataInicialPredefinida) {
      const data =
        dataInicialPredefinida.split('T')[0] ?? dataInicialPredefinida;

      setInicio(data);

      const dt = new Date(data);
      dt.setDate(dt.getDate() + 4);

      const fimSugerido = dt.toISOString().split('T')[0];
      setFim(fimSugerido);
    }
  }, [open, dataInicialPredefinida]);

  // ==================== HANDLERS ====================
  const toggle = (item: string) =>
    setSelecionados((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );

function salvar() {
  let idsFinais: string[] = [];

  if (modo === 'logradouro') {
    // Converte logradouros em IDs de vagas
    idsFinais = selecionados.flatMap((log) =>
      vagasPorLogradouro[log]?.map((vaga) => vaga.id) || []
    );
  } else {

    idsFinais = selecionados;
  }

  const idsUnicos = Array.from(new Set(idsFinais));

  onSalvar({
    inicio: `${inicio}T00:00`,
    fim: `${fim}T23:59`,
    modo,
    selecionados: idsUnicos,
  });

  setSelecionados([]);
  setInicio('');
  setFim('');
  onClose();
}

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-auto w-[min(900px,95%)]">
        
        {/* ==================== HEADER ==================== */}
        <DialogHeader>
          <DialogTitle>Adicionar Disponibilidade</DialogTitle>
        </DialogHeader>

        {/* ==================== MODOS DE SELEÇÃO ==================== */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setModo('logradouro')}
            className={`px-3 py-1 rounded ${
              modo === 'logradouro' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            Por Logradouro
          </button>

          <button
            onClick={() => setModo('personalizado')}
            className={`px-3 py-1 rounded ${
              modo === 'personalizado' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            Personalizado
          </button>
        </div>

        {/* ==================== MODO: POR LOGRADOURO ==================== */}
        {modo === 'logradouro' ? (
          <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-auto mb-4">
            {Object.keys(vagasPorLogradouro).map((log) => (
              <label
                key={log}
                className="flex items-center gap-2 p-2 border rounded"
              >
                <input
                  type="checkbox"
                  checked={selecionados.includes(log)}
                  onChange={() => toggle(log)}
                />
                {log}
              </label>
            ))}
          </div>
        ) : (
          /* ==================== MODO: PERSONALIZADO ==================== */
          <div className="space-y-2 max-h-[40vh] overflow-auto mb-4">
            {Object.entries(vagasPorLogradouro).map(([log, lista]) => (
              <div key={log} className="border rounded p-2 bg-gray-50">
                <div className="font-semibold mb-1">{log}</div>
                <div className="space-y-1 ml-3">
                  {lista.map((vaga) => (
                    <label key={vaga.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={selecionados.includes(vaga.id)}
                        onCheckedChange={() => toggle(vaga.id)}
                      />
                      Vaga {vaga.endereco.logradouro} - {vaga.numeroEndereco}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== DATAS ==================== */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Início</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Fim</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>
        </div>

        {/* ==================== FOOTER ==================== */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={salvar}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}