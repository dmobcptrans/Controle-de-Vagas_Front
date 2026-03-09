'use client';

import { useState } from 'react';

interface Regra {
  mensagem: string;
  valido: boolean;
}

interface Forca {
  texto: string;
  nivel: number;
}

interface RetornoValidacaoSenha {
  senha: string;
  setSenha: (senha: string) => void;
  regras: Regra[];
  erros: string[];
  ehValida: boolean;
  forca: Forca | null;
}

const REGRAS_SENHA = [
  { mensagem: 'Mínimo de 6 caracteres', teste: (s: string) => s.length >= 6 },
  {
    mensagem: 'Pelo menos uma letra minúscula',
    teste: (s: string) => /[a-z]/.test(s),
  },
  {
    mensagem: 'Pelo menos uma letra maiúscula',
    teste: (s: string) => /[A-Z]/.test(s),
  },
  { mensagem: 'Pelo menos um número', teste: (s: string) => /\d/.test(s) },
  {
    mensagem: 'Pelo menos um caractere especial (!@#...)',
    teste: (s: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(s),
  },
];

const obterForcaSenha = (senha: string): Forca | null => {
  if (senha.length === 0) return null;

  let pontuacao = 0;

  if (senha.length >= 6) pontuacao++;
  if (senha.length >= 10) pontuacao++;
  if (/[a-z]/.test(senha)) pontuacao++;
  if (/[A-Z]/.test(senha)) pontuacao++;
  if (/\d/.test(senha)) pontuacao++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)) pontuacao++;
  if (senha.length >= 14) pontuacao++;

  if (pontuacao <= 2) return { texto: 'Fraca', nivel: 1 };
  if (pontuacao <= 4) return { texto: 'Moderada', nivel: 2 };
  return { texto: 'Forte', nivel: 3 };
};

const useValidacaoSenha = (): RetornoValidacaoSenha => {
  const [senha, setSenha] = useState('');

  const regras = REGRAS_SENHA.map((r) => ({
    mensagem: r.mensagem,
    valido: r.teste(senha),
  }));
  const erros = regras.filter((r) => !r.valido).map((r) => r.mensagem);
  const ehValida = erros.length === 0;
  const forca = obterForcaSenha(senha);

  return { senha, setSenha, regras, erros, ehValida, forca };
};

export default useValidacaoSenha;
