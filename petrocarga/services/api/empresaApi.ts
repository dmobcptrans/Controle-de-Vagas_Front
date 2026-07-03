import { clientApi } from '../clientApi';
import {
  EmpresaPayload,
  EmpresaResult,
} from '../../lib/types/personas/empresa';

export async function addEmpresa(
  prevState: EmpresaResult | null,
  formData: FormData,
): Promise<EmpresaResult> {
  const payload: EmpresaPayload = {
    nome: formData.get('nome') as string,
    telefone: formData.get('telefone') as string,
    email: (formData.get('email') as string).toLowerCase(),
    senha: formData.get('senha') as string,
    cnpj: formData.get('cnpj') as string,
    aceitouTermos:
      formData.get('aceitouTermos') === 'true' ||
      formData.get('aceitouTermos') === 'on',
  };

  try {
    await clientApi('/petrocarga/empresas', {
      method: 'POST',
      json: payload,
    });

    return {
      error: false,
      message: 'Empresa cadastrada com sucesso!',
    };
  } catch (err: unknown) {
    return {
      error: true,
      message: err instanceof Error ? err.message : 'Erro ao cadastrar empresa',
      valores: payload,
    };
  }
}

export async function getEmpresaByUsuarioId(usuarioId: string) {
  const res = await clientApi(`/petrocarga/empresas/${usuarioId}`);

  if (!res.ok) {
    let msg = 'Erro ao buscar empresa';

    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}

    return { error: true, message: msg };
  }

  const empresa = await res.json();

  return {
    error: false,
    empresa,
  };
}
