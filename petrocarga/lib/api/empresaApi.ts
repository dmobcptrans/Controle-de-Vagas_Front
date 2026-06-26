import { clientApi } from '../clientApi';
import { EmpresaPayload, EmpresaResult } from '../types/empresa';


export async function addEmpresa(
  prevState: EmpresaResult | null,
  formData: FormData,
): Promise<EmpresaResult> {
  const payload: EmpresaPayload = {
    usuario: {
      nome: formData.get('nome') as string,
      cpf: formData.get('cpf') as string,
      telefone: formData.get('telefone') as string,
      email: (formData.get('email') as string).toLowerCase(),
      senha: formData.get('senha') as string,
    },
    cnpj: formData.get('cnpj') as string,
    razaoSocial: formData.get('razaoSocial') as string,
    aceitouTermos: formData.get('aceitouTermos') === 'true' || formData.get('aceitouTermos') === 'on',
  };

  try {
    await clientApi('/petrocarga/empresas/cadastro', {
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
      message:
        err instanceof Error ? err.message : 'Erro ao cadastrar empresa',
      valores: payload,
    };
  }
}