import { clientApi } from '../clientApi';
import {
  EmpresaPayload,
  EmpresaResult,
  MotoristaResponse,
  VeiculoMotoristaEmpresaResponse,
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

export async function getMotoristaEmpresaByUsuarioId(
  usuarioId: string,
  numeroPagina: number = 0,
  tamanhoPagina: number = 10,
): Promise<MotoristaResponse> {
  try {
    const res = await clientApi(
      `/petrocarga/motoristas/byEmpresa/${usuarioId}?numeroPagina=${numeroPagina}&tamanhoPagina=${tamanhoPagina}`,
    );

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status}`);
    }

    const data = await res.json();

    return {
      content: data.content ?? [],
      totalElementos: data.totalElementos ?? 0,
      totalPaginas: data.totalPaginas ?? 0,
      tamanhoPagina: data.tamanhoPagina ?? tamanhoPagina,
      pagina: data.pagina ?? numeroPagina,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erro ao buscar motoristas da empresa.';
    throw new Error(message);
  }
}

export async function desvincularMotoristaEmpresa(
  usuarioId?: string,
  motoristaId?: string,
) {
  try {
    const res = await clientApi(
      `/petrocarga/motoristas/desvincularEmpresa/${usuarioId}/${motoristaId}`,
      {
        method: 'PATCH',
      },
    );
    return { success: true };
  } catch (err: unknown) {
    console.error('Erro ao desvincular motorista:', err);
    return {
      error: true,
      message:
        err instanceof Error ? err.message : 'Erro desconhecido ao desvincular',
    };
  }
}

export async function getVeiculosVinculadosMotoristaEmpresa(
  usuarioId: string,
  motoristaId: string,
  numeroPagina: number = 0,
  tamanhoPagina: number = 10,
): Promise<VeiculoMotoristaEmpresaResponse> {
  try {
    const res = await clientApi(
      `/petrocarga/veiculoEmpresaMotorista/veiculos/${usuarioId}/${motoristaId}?numeroPagina=${numeroPagina}&tamanhoPagina=${tamanhoPagina}`,
    );

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status}`);
    }

    const data = await res.json();

    return {
      content: data.content ?? [],
      totalElementos: data.totalElementos ?? 0,
      totalPaginas: data.totalPaginas ?? 0,
      tamanhoPagina: data.tamanhoPagina ?? tamanhoPagina,
      pagina: data.pagina ?? numeroPagina,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erro ao buscar veiculos vinculados do motorista na empresa.';
    throw new Error(message);
  }
}

export async function vincularVeiculoMotoristaEmpresa(
  empresaId: string,
  veiculoId: string,
  motoristaId: string,
) {
  try {
    const res = await clientApi(
      `/petrocarga/veiculoEmpresaMotorista/vincular/${empresaId}?veiculoId=${veiculoId}&motoristaId=${motoristaId}`,
      {
        method: 'POST',
      },
    );

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status}`);
    }

    return {
      error: false,
      message: 'Veículo vinculado ao motorista com sucesso!',
    };
  } catch (err: unknown) {
    return {
      error: true,
      message:
        err instanceof Error
          ? err.message
          : 'Erro ao vincular veículo ao motorista.',
    };
  }
}

export async function desvincularVeiculoMotoristaEmpresa(
  empresaId: string,
  veiculoId: string,
  motoristaId: string,
) {
  try {
    const res = await clientApi(
      `/petrocarga/veiculoEmpresaMotorista/desvincular/${empresaId}?veiculoId=${veiculoId}&motoristaId=${motoristaId}`,
      {
        method: 'POST',
      },
    );

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status}`);
    }

    return {
      error: false,
      message: 'Veículo vinculado ao motorista com sucesso!',
    };
  } catch (err: unknown) {
    return {
      error: true,
      message:
        err instanceof Error
          ? err.message
          : 'Erro ao vincular veículo ao motorista.',
    };
  }
}