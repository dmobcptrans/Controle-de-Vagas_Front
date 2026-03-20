'use client';

import { useOnboarding } from '@/context/OnboardingContext';
import { useState } from 'react';
import ModalTermos from '../login/ModalTermos';
import { Checkbox } from '@/components/ui/checkbox';

// Lista expandida de categorias
const CNH_CATS = ['B', 'AB', 'C', 'AC', 'D', 'AD', 'E', 'AE'];

export default function OnboardingModal({ lockInitialSteps = false }: { lockInitialSteps?: boolean }) {
  const { isOpen, step, data, updateData, nextStep, prevStep, submit, submitVeiculo } = useOnboarding();
  const [showPassword, setShowPassword] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [exibirConfirmarSenha, setExibirConfirmarSenha] = useState(false);
  const [aceitarTermos, setAceitarTermos] = useState(false);
  const [mostrarModalTermos, setMostrarModalTermos] = useState(false);

  const { isVeiculoOnlyFlow } = useOnboarding();
  const isLockedFlow = isVeiculoOnlyFlow;

  // Estado para controlar a "gaveta" de seleção da CNH
  const [isCnhDrawerOpen, setIsCnhDrawerOpen] = useState(false);

  // Estado do veículo (Step 4)
  const [veiculo, setVeiculo] = useState({
    placa: '',
    marca: '',
    modelo: '',
    tipo: 'AUTOMOVEL',
    tipoProprietario: "CPF",
    cpfProprietario: '',
    cnpjProprietario: '',
  });

  const senhasIguais = data.senha === confirmarSenha;

  if (!isOpen) return null;

  const totalSteps = 4;

  const pwdStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };


  const fmtCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);

    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const fmtCNPJ = (v: string) =>
    v
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);

  const fmtTel = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return value;
  };

  const onlyNumbers = (value: string) => value.replace(/\D/g, '');

  const isStepValid = () => {
    if (step === 1) {
      const cpf = (data.cpf || '').replace(/\D/g, '');
      const tel = (data.telefone || '').replace(/\D/g, '');
      return cpf.length >= 11 && tel.length >= 10 && (data.senha || '').length >= 8 && senhasIguais;
    }
    if (step === 2) {
      return !!(data.tipoCnh && data.numeroCnh?.length >= 8 && data.dataValidadeCnh);
    }
    if (step === 3) return !!data.aceitarTermos;
    if (step === 4) {
      return (
        veiculo.placa.length >= 7 &&
        !!veiculo.marca &&
        !!veiculo.modelo &&
        !!(veiculo.cpfProprietario || veiculo.cnpjProprietario)
      );
    }
    return false;
  };

  const handleNext = async () => {
    if (!isStepValid()) return;

    if (isLockedFlow && step < 4) {
      return;
    }

    if (step === 3) {
      await submit();
      return;
    }
    if (step === 4) {
      await submitVeiculo(veiculo);
      return;
    }
    nextStep();
  };

  const stepMeta = [
    { title: 'Dados pessoais', sub: 'Etapa 1 de 4' },
    { title: 'Habilitação', sub: 'Etapa 2 de 4' },
    { title: 'Termos e condições', sub: 'Etapa 3 de 4' },
    { title: 'Veículo', sub: 'Etapa 4 de 4' },
  ];

  const inputCls =
    'mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 sm:py-2.5 text-base sm:text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer text-left flex items-center justify-between';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md sm:max-w-2xl rounded-2xl bg-white p-5 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
              {step === 1 && <PersonIcon />}
              {step === 2 && <CNHIcon />}
              {step === 3 && <CheckIcon />}
              {step === 4 && <CarIcon />}
            </div>
            <div>
              <h2 className="text-base font-medium text-gray-900">{stepMeta[step - 1].title}</h2>
              <p className="text-xs text-gray-400">{stepMeta[step - 1].sub}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="h-1 flex-1 rounded-full transition-all" style={{ background: s <= step ? '#3B82F6' : '#E5E7EB' }} />
            ))}
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="CPF">
              <input className={inputCls} inputMode="numeric" placeholder="000.000.000-00" value={fmtCPF(data.cpf || '')} onChange={(e) =>
                updateData({
                  cpf: onlyNumbers(e.target.value).slice(0, 11),
                })
              } />
            </Field>
            <Field label="Telefone">
              <input className={inputCls} inputMode="numeric" placeholder="(00) 00000-0000" value={fmtTel(data.telefone || '')} onChange={(e) => updateData({ telefone: onlyNumbers(e.target.value) })} />
            </Field>
            <Field label="Senha">
              <div className="relative">
                <input className={inputCls + ' pr-10'} type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={data.senha || ''} onChange={(e) => updateData({ senha: e.target.value })} />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600">
                  <EyeIcon />
                </button>
              </div>
            </Field>
            <Field label="Confirmar senha">
              <div className="relative">
                <input className={`${inputCls} pr-10 ${!senhasIguais && confirmarSenha !== '' ? 'border-red-500' : ''}`} type={exibirConfirmarSenha ? 'text' : 'password'} placeholder="Digite novamente" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />
                <button type="button" onClick={() => setExibirConfirmarSenha(!exibirConfirmarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600">
                  <EyeIcon />
                </button>
              </div>
            </Field>
          </div>
        )}

        {/* Step 2 — CNH */}
        {step === 2 && (
          <div className="space-y-4">
            <Field label="Categoria da CNH">
              <button
                type="button"
                onClick={() => setIsCnhDrawerOpen(true)}
                className={inputCls}
              >
                <span className={data.tipoCnh ? 'text-gray-900' : 'text-gray-400'}>
                  {data.tipoCnh || 'Selecione a categoria'}
                </span>
                <ChevronDownIcon />
              </button>
            </Field>

            <Field label="Número da CNH">
              <input className={inputCls} placeholder="00000000000" maxLength={11} inputMode="numeric" value={data.numeroCnh || ''} onChange={(e) => updateData({ numeroCnh: e.target.value.replace(/\D/g, '') })} />
            </Field>

            <Field label="Data de validade">
              <input type="date" className={inputCls} value={data.dataValidadeCnh || ''} onChange={(e) => updateData({ dataValidadeCnh: e.target.value })} />
            </Field>
          </div>
        )}

        {/* Step 3 — Termos */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="termos"
                checked={data.aceitarTermos}
                onCheckedChange={(checked) => {
                  const value = checked as boolean;
                  setAceitarTermos(value);
                  updateData({ aceitarTermos: value });
                }}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="termos"
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  Li e aceito os{' '}
                  <button
                    type="button"
                    onClick={() => setMostrarModalTermos(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2 hover:no-underline transition-colors"
                  >
                    Termos de Uso e Política de Privacidade
                  </button>
                </label>
                <p className="text-xs text-gray-500">
                  É necessário aceitar os termos para ativar sua conta
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — Veículo */}
        {step === 4 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Placa">
              <input
                className={inputCls}
                placeholder="ABC1D23"
                maxLength={8}
                value={veiculo.placa}
                onChange={(e) => setVeiculo({ ...veiculo, placa: e.target.value.toUpperCase() })}
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
                <option value="AUTOMOVEL">Automóvel</option>
                <option value="VUC">VUC</option>
                <option value="CAMINHONETA">Caminhoneta</option>
                <option value="CAMINHAO_MEDIO">Caminhão Médio</option>
                <option value="CAMINHAO_LONGO">Caminhão Longo</option>
              </select>
            </Field>

            <div className="col-span-1 sm:col-span-2">
              <Field label="Tipo de proprietário">
                <div className="flex gap-3">
                  {["CPF", "CNPJ"].map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() =>
                        setVeiculo({
                          ...veiculo,
                          tipoProprietario: tipo as "CPF" | "CNPJ",
                          cpfProprietario: "",
                          cnpjProprietario: "",
                        })
                      }
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${veiculo.tipoProprietario === tipo
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-transparent border-gray-300 text-gray-600 hover:border-blue-400"
                        }`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {veiculo.tipoProprietario === "CPF" && (
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

            {veiculo.tipoProprietario === "CNPJ" && (
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
        )}


        {/* Footer */}
        <div
          className={`mt-8 flex items-center gap-3 ${isLockedFlow && step === 4 ? 'justify-center' : 'justify-between'
            }`}
        >
          {step > 1 && !(isLockedFlow && step === 4) && (
            <button onClick={prevStep} className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 flex-1">
              Voltar
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-40 ${isLockedFlow && step === 4 ? 'w-full max-w-xs' : 'flex-1'
              }`}
          >
            {step === totalSteps ? 'Finalizar' : 'Próximo'}
          </button>
        </div>

        {/* GAVETA DE SELEÇÃO (CNH DRAWER) */}
        {isCnhDrawerOpen && (
          <div className="absolute inset-0 z-[60] flex flex-col bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Categorias</h3>
                <p className="text-xs text-gray-500">Escolha uma das opções abaixo</p>
              </div>
              <button onClick={() => setIsCnhDrawerOpen(false)} className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200">
                <CloseIcon />
              </button>
            </div>

            {/* Grid 3x3 para mostrar as 9 opções sem scroll */}
            <div className="flex flex-1 items-center">
              <div className="grid w-full grid-cols-3 gap-4">
                {CNH_CATS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      updateData({ tipoCnh: cat });
                      setIsCnhDrawerOpen(false);
                    }}
                    className={`flex h-16 flex-col items-center justify-center rounded-xl border-2 transition-all ${data.tipoCnh === cat
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                      }`}
                  >
                    <span className="text-lg font-bold">{cat}</span>
                    {data.tipoCnh === cat && <div className="h-1 w-4 rounded-full bg-blue-500 mt-1" />}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400">
              Toque na categoria para selecionar
            </p>
          </div>
        )}
      </div>
      <ModalTermos
        open={mostrarModalTermos}
        onOpenChange={setMostrarModalTermos}
        onClose={() => setMostrarModalTermos(false)}
      />
    </div>
  );
}

// --- Componentes de Apoio ---

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
      {children}
    </div>
  );
}

function TermoItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 hover:bg-gray-50">
      <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-blue-600" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// --- Ícones ---

function ChevronDownIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>;
}
function CloseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>;
}
function CheckCircleIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
}
function PersonIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="#3B82F6" strokeWidth="1.5" /><path d="M2 13c0-3 2.5-5 6-5s6 2 6 5" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" /></svg>; }
function CNHIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3.5" width="14" height="9" rx="2" stroke="#3B82F6" strokeWidth="1.5" /><path d="M4 8h4M4 10.5h2.5" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" /><circle cx="11.5" cy="8.5" r="2" stroke="#3B82F6" strokeWidth="1.3" /></svg>; }
function CheckIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5 6.5-7" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function EyeIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3" /><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" /></svg>; }
function CarIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 9l1.5-4h9L14 9" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><rect x="1" y="9" width="14" height="4" rx="1.5" stroke="#3B82F6" strokeWidth="1.5" /><circle cx="4.5" cy="13" r="1" fill="#3B82F6" /><circle cx="11.5" cy="13" r="1" fill="#3B82F6" /></svg>; }
