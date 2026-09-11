import type { Usuario } from '@/lib/types/personas/user2';

export function normalizeUserData(
  data: Record<string, unknown>,
): Usuario {
  const dadosExtras =
    data.dadosExtras as
      | Record<string, unknown>
      | undefined;

  return {
    id: String(data.id ?? ''),
    nome: String(data.nome ?? ''),

    telefone: data.telefone
      ? String(data.telefone)
      : undefined,

    email: data.email
      ? String(data.email)
      : undefined,

    cpf: data.cpf
      ? String(data.cpf)
      : undefined,

    cnpj: data.cnpj
      ? String(data.cnpj)
      : undefined,

    permissao:
      (data.permissao as Usuario['permissao']) ??
      'MOTORISTA',

    criadoEm: String(data.criadoEm ?? ''),

    ativo: Boolean(data.ativo ?? false),

    desativadoEm: data.desativadoEm
      ? String(data.desativadoEm)
      : undefined,

    dadosExtras: dadosExtras
      ? {
          matricula: dadosExtras.matricula
            ? String(dadosExtras.matricula)
            : undefined,

          empresaId: dadosExtras.empresaId
            ? String(dadosExtras.empresaId)
            : undefined,

          empresaCnpj: dadosExtras.empresaCnpj
            ? String(dadosExtras.empresaCnpj)
            : undefined,

          empresaRazaoSocial:
            dadosExtras.empresaRazaoSocial
              ? String(
                  dadosExtras.empresaRazaoSocial,
                )
              : undefined,

          possuiVeiculoAtivo: Boolean(
            dadosExtras.possuiVeiculoAtivo ?? false,
          ),
        }
      : undefined,
  };
}