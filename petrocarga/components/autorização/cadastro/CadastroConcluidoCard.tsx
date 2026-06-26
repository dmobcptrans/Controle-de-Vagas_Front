'use client';

import { useEffect, useState } from 'react';

type CadastroConcluidoCardProps = {
  tipo: 'motorista' | 'empresa';
  onAtivarConta: () => void;
};

const TEMPO_TOTAL = 7 * 60; 

export default function CadastroConcluidoCard({
  tipo,
  onAtivarConta,
}: CadastroConcluidoCardProps) {
  const [segundosRestantes, setSegundosRestantes] =
    useState(TEMPO_TOTAL);

  useEffect(() => {
    const interval = setInterval(() => {
      setSegundosRestantes((tempo) => {
        if (tempo <= 1) {
          clearInterval(interval);
          return 0;
        }

        return tempo - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const porcentagem =
    (segundosRestantes / TEMPO_TOTAL) * 100;

  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;

  return (
    <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h2 className="mt-6 text-center text-2xl font-bold text-slate-900">
        {tipo === 'motorista'
          ? 'Motorista cadastrado!'
          : 'Empresa cadastrada!'}
      </h2>

      <p className="mt-3 text-center text-slate-600">
        Seu cadastro foi realizado com sucesso.
      </p>

      <p className="mt-2 text-center text-slate-600">
        Enviamos um código de ativação para o e-mail informado.
        Para concluir o processo, ative sua conta antes que o
        código expire.
      </p>

      <div className="mt-8">
        <div className="mb-2 flex justify-between text-sm font-medium text-slate-600">
          <span>Tempo restante</span>

          <span>
            {String(minutos).padStart(2, '0')}:
            {String(segundos).padStart(2, '0')}
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-1000"
            style={{
              width: `${porcentagem}%`,
            }}
          />
        </div>
      </div>

      <button
        onClick={onAtivarConta}
        className="mt-8 h-12 w-full rounded-xl bg-blue-600 font-semibold text-white transition hover:bg-blue-700"
      >
        Ativar conta
      </button>
    </div>
  );
}