'use client';

import { useOnboarding } from '@/context/OnboardingContext';
import { useState } from 'react';

const CNH_CATS = ['A', 'B', 'AB', 'C', 'D'];

export default function OnboardingModal() {
  const { isOpen, step, data, updateData, nextStep, prevStep, submit } = useOnboarding();
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const totalSteps = 3;

  const pwdStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strengthColors = ['', '#E24B4A', '#EF9F27', '#1D9E75', '#1D9E75'];
  const strengthLabels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];
  const strength = pwdStrength(data.senha || '');

const fmtCPF = (value: string) => {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6)
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9)
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

const fmtTel = (value: string) => {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 11)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;

  return value;
};

const onlyNumbers = (value: string) => value.replace(/\D/g, '');

  const isStepValid = () => {
    if (step === 1) {
      const cpf = (data.cpf || '').replace(/\D/g, '');
      const tel = (data.telefone || '').replace(/\D/g, '');
      return cpf.length === 11 && tel.length >= 10 && (data.senha || '').length >= 8;
    }
    if (step === 2) {
      return !!(data.tipoCnh && data.numeroCnh?.length >= 8 && data.dataValidadeCnh);
    }
    if (step === 3) return !!data.aceitarTermos;
    return false;
  };

  const handleNext = async () => {
    if (!isStepValid()) return;
    if (step === totalSteps) await submit();
    else nextStep();
  };

  const stepMeta = [
    { title: 'Dados pessoais', sub: 'Etapa 1 de 3' },
    { title: 'Habilitação', sub: 'Etapa 2 de 3' },
    { title: 'Termos e condições', sub: 'Etapa 3 de 3' },
  ];

  const inputCls =
    'mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
              {step === 1 && <PersonIcon />}
              {step === 2 && <CNHIcon />}
              {step === 3 && <CheckIcon />}
            </div>
            <div>
              <h2 className="text-base font-medium text-gray-900">
                {stepMeta[step - 1].title}
              </h2>
              <p className="text-xs text-gray-400">{stepMeta[step - 1].sub}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="h-1 flex-1 rounded-full transition-all"
                style={{ background: s <= step ? '#3B82F6' : '#E5E7EB' }}
              />
            ))}
          </div>
        </div>

        {/* Step 1 — dados pessoais */}
        {step === 1 && (
          <div className="space-y-4">
            <Field label="CPF">
              <input
                className={inputCls}
                placeholder="000.000.000-00"
                value={fmtCPF(data.cpf)}
                onChange={(e) => updateData({ cpf: onlyNumbers(e.target.value) })}
              />
            </Field>

            <Field label="Telefone">
              <input
                className={inputCls}
                placeholder="(00) 00000-0000"
                value={fmtTel(data.telefone)}
                onChange={(e) => updateData({ telefone: onlyNumbers(e.target.value) })}
              />
            </Field>

            <Field label="Senha">
              <div className="relative">
                <input
                  className={inputCls + ' pr-10'}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={data.senha || ''}
                  onChange={(e) => updateData({ senha: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeIcon />
                </button>
              </div>
              {(data.senha || '').length > 0 && (
                <>
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-0.5 flex-1 rounded-full transition-all"
                        style={{ background: i <= strength ? strengthColors[strength] : '#E5E7EB' }}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs" style={{ color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </p>
                </>
              )}
            </Field>
          </div>
        )}

        {/* Step 2 — CNH */}
        {step === 2 && (
          <div className="space-y-4">
            <Field label="Categoria da CNH">
              <div className="mt-1 flex gap-2">
                {CNH_CATS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => updateData({ tipoCnh: cat })}
                    className="flex-1 rounded-lg border py-2.5 text-sm font-medium transition-all"
                    style={{
                      background: data.tipoCnh === cat ? '#EFF6FF' : '#fff',
                      borderColor: data.tipoCnh === cat ? '#3B82F6' : '#E5E7EB',
                      color: data.tipoCnh === cat ? '#3B82F6' : '#374151',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Número da CNH">
              <input
                className={inputCls}
                placeholder="00000000000"
                maxLength={11}
                value={data.numeroCnh}
                onChange={(e) => updateData({ numeroCnh: e.target.value.replace(/\D/g, '') })}
              />
            </Field>

            <Field label="Data de validade">
              <input
                type="date"
                className={inputCls}
                value={data.dataValidadeCnh}
                onChange={(e) => updateData({ dataValidadeCnh: e.target.value })}
              />
            </Field>
          </div>
        )}

        {/* Step 3 — Termos */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs leading-relaxed text-gray-500" style={{ maxHeight: 140, overflowY: 'auto' }}>
              Ao criar sua conta, você concorda com os Termos de Uso e a Política de Privacidade.
              Seus dados serão utilizados exclusivamente para fins de cadastro e verificação,
              em conformidade com a LGPD. Você pode solicitar a exclusão dos seus dados a qualquer momento.
            </div>

            <TermoItem
              label={<>Li e aceito os <span className="text-blue-500">Termos de Uso</span> e a <span className="text-blue-500">Política de Privacidade</span></>}
              checked={!!data.aceitarTermos}
              onChange={(v) => updateData({ aceitarTermos: v })}
            />
            </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              Voltar
            </button>
          ) : <div />}

          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step === totalSteps ? 'Finalizar' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function TermoItem({ label, checked, onChange }: { label: React.ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50">
      <div
        onClick={() => onChange(!checked)}
        className="mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded border transition"
        style={{
          background: checked ? '#3B82F6' : '#fff',
          borderColor: checked ? '#3B82F6' : '#D1D5DB',
          width: 18, height: 18,
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5 4-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-700 leading-relaxed" onClick={() => onChange(!checked)}>{label}</span>
    </label>
  );
}

function PersonIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="#3B82F6" strokeWidth="1.5" /><path d="M2 13c0-3 2.5-5 6-5s6 2 6 5" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function CNHIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3.5" width="14" height="9" rx="2" stroke="#3B82F6" strokeWidth="1.5" /><path d="M4 8h4M4 10.5h2.5" stroke="#3B82F6" strokeWidth="1.3" strokeLinecap="round" /><circle cx="11.5" cy="8.5" r="2" stroke="#3B82F6" strokeWidth="1.3" /></svg>;
}
function CheckIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5 6.5-7" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function EyeIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3" /><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" /></svg>;
}