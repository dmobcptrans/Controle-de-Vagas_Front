'use client';

import { useOnboarding } from '@/contexts/OnboardingContext';
import { useState } from 'react';
import { Field, inputCls, fmtCPF, fmtCNPJ, onlyNumbers, CloseIcon, CarIcon } from './Onboardinghelpers';

type VeiculoFormData = {
  placa: string;
  marca: string;
  modelo: string;
  tipo: string;
  tipoProprietario: 'CPF' | 'CNPJ';
  cpfProprietario: string;
  cnpjProprietario: string;
};

const initialVeiculo: VeiculoFormData = {
  placa: '',
  marca: '',
  modelo: '',
  tipo: 'AUTOMOVEL',
  tipoProprietario: 'CPF',
  cpfProprietario: '',
  cnpjProprietario: '',
};

/**
 * @component OnboardingVeiculoModal
 * @version 1.0.0
 *
 * @description Modal de CADASTRO DE VEÍCULO, independente do modal de
 * complemento de cadastro. Diferente do `OnboardingCadastroModal`, este
 * modal PODE ser fechado pelo usuário (botão "X" no header e clique no
 * backdrop), via `closeVeiculoModal()`.
 *
 * ----------------------------------------------------------------------------
 * 📋 CAMPOS:
 * ----------------------------------------------------------------------------
 *
 *    - Placa, Marca, Modelo
 *    - Tipo (select com 5 opções)
 *    - Tipo de proprietário (CPF/CNPJ)
 *    - CPF ou CNPJ do proprietário (com máscara)
 *
 * @example
 * ```tsx
 * <OnboardingVeiculoModal />
 * ```
 */
export default function OnboardingVeiculoModal() {
  const { isVeiculoOpen, submitVeiculo, closeVeiculoModal } = useOnboarding();

  const [veiculo, setVeiculo] = useState<VeiculoFormData>(initialVeiculo);

  if (!isVeiculoOpen) return null;

  const isFormValid = () => {
    return (
      veiculo.placa.length >= 7 &&
      !!veiculo.marca &&
      !!veiculo.modelo &&
      !!(veiculo.cpfProprietario || veiculo.cnpjProprietario)
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    await submitVeiculo(veiculo);
    setVeiculo(initialVeiculo);
  };

  const handleClose = () => {
    closeVeiculoModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md sm:max-w-2xl rounded-2xl bg-white p-5 sm:p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — com botão de fechar (X) */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
              <CarIcon />
            </div>
            <div>
              <h2 className="text-base font-medium text-gray-900">Veículo</h2>
              <p className="text-xs text-gray-400">Cadastre os dados do seu veículo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Placa">
            <input
              className={inputCls}
              placeholder="ABC1D23"
              maxLength={8}
              value={veiculo.placa}
              onChange={(e) =>
                setVeiculo({ ...veiculo, placa: e.target.value.toUpperCase() })
              }
            />
          </Field>

          <Field label="Marca">
            <input
              className={inputCls}
              placeholder="Ex: Toyota"
              value={veiculo.marca}
              onChange={(e) => setVeiculo({ ...veiculo, marca: e.target.value })}
            />
          </Field>

          <Field label="Modelo">
            <input
              className={inputCls}
              placeholder="Ex: Corolla"
              value={veiculo.modelo}
              onChange={(e) => setVeiculo({ ...veiculo, modelo: e.target.value })}
            />
          </Field>

          <Field label="Tipo">
            <select
              className={inputCls}
              value={veiculo.tipo}
              onChange={(e) => setVeiculo({ ...veiculo, tipo: e.target.value })}
            >
              <option value="AUTOMOVEL">Carro - Até 5 metros</option>
              <option value="CAMINHONETA">Caminhonete - Até 6 metros</option>
              <option value="VUC">VUC - Até 8 metros</option>
              <option value="CAMINHAO_MEDIO">Caminhão Médio - 9 a 12 metros</option>
              <option value="CAMINHAO_LONGO">Caminhão Longo - 13 a 19 metros</option>
            </select>
          </Field>

          <div className="col-span-1 sm:col-span-2">
            <Field label="Tipo de proprietário">
              <div className="flex gap-3">
                {['CPF', 'CNPJ'].map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() =>
                      setVeiculo({
                        ...veiculo,
                        tipoProprietario: tipo as 'CPF' | 'CNPJ',
                        cpfProprietario: '',
                        cnpjProprietario: '',
                      })
                    }
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      veiculo.tipoProprietario === tipo
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-transparent border-gray-300 text-gray-600 hover:border-blue-400'
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {veiculo.tipoProprietario === 'CPF' && (
            <div className="col-span-1 sm:col-span-2">
              <Field label="CPF do proprietário">
                <input
                  className={inputCls}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  value={fmtCPF(veiculo.cpfProprietario)}
                  onChange={(e) =>
                    setVeiculo({
                      ...veiculo,
                      cpfProprietario: onlyNumbers(e.target.value).slice(0, 11),
                    })
                  }
                />
              </Field>
            </div>
          )}

          {veiculo.tipoProprietario === 'CNPJ' && (
            <div className="col-span-1 sm:col-span-2">
              <Field label="CNPJ do proprietário">
                <input
                  className={inputCls}
                  placeholder="00.000.000/0000-00"
                  inputMode="numeric"
                  value={fmtCNPJ(veiculo.cnpjProprietario)}
                  onChange={(e) =>
                    setVeiculo({
                      ...veiculo,
                      cnpjProprietario: onlyNumbers(e.target.value).slice(0, 14),
                    })
                  }
                />
              </Field>
            </div>
          )}
        </div>

        {/* Footer — apenas Finalizar (não há etapa anterior neste modal) */}
        <div className="mt-8 flex items-center justify-center">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="w-full max-w-xs rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-40"
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}