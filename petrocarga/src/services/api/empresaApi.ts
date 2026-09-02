import { MotoristaEmpresaResponse } from './../../lib/types/personas/motorista';
import { VeiculoPaginado } from '@/lib/types/veiculo';
import { clientApi } from '../clientApi';
import {
  EmpresaInput,
  EmpresaResponse,
} from '../../lib/types/personas/empresa';


/**
 * Cadastra uma nova empresa.
 */
export async function addEmpresa(
  prevState: EmpresaResponse | null,
  formData: FormData,
): Promise<EmpresaResponse> {
  const payload: EmpresaInput = {
    nome: formData.get('nome') as string,
    telefone: formData.get('telefone') as string,
    email: (formData.get('email') as string).toLowerCase(),
    senha: formData.get('senha') as string,
    cpf: formData.get('cpf') as string,
    matricula: formData.get('matricula') as string,
    cnpj: formData.get('cnpj') as string,
    razaoSocial: formData.get('razaoSocial') as string,
    tipoCnh: formData.get('tipoCnh') as string,
    numeroCnh: formData.get('numeroCnh') as string,
    dataValidadeCnh: formData.get('dataValidadeCnh') as string,
    empresaId: formData.get('empresaId') as string,
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
        err instanceof Error
          ? err.message
          : 'Erro ao cadastrar empresa',
      valores: payload,
    };
  }
}

/**
 * Atualiza uma empresa existente.
 */
export async function atualizarEmpresa(
  formData: FormData,
): Promise<EmpresaResponse> {
  const empresaId = formData.get('id') as string;

  const payload: EmpresaInput = {
    id: empresaId,
    nome: formData.get('nome') as string,
    email: (formData.get('email') as string).toLowerCase(),
    telefone: formData.get('telefone') as string,
    senha: (formData.get('senha') as string) || undefined,
    cpf: formData.get('cpf') as string,
    matricula: formData.get('matricula') as string,
    cnpj: formData.get('cnpj') as string,
    razaoSocial: formData.get('razaoSocial') as string,
    tipoCnh: formData.get('tipoCnh') as string,
    numeroCnh: formData.get('numeroCnh') as string,
    dataValidadeCnh: formData.get('dataValidadeCnh') as string,
    empresaId: formData.get('empresaId') as string,
  };

  try {
    await clientApi(`/petrocarga/empresas/${empresaId}`, {
      method: 'PATCH',
      json: payload,
    });

    return {
      error: false,
      message: 'Empresa atualizada com sucesso!',
    };
  } catch (err: unknown) {
    console.error('Erro ao atualizar empresa:', err);

    return {
      error: true,
      message:
        err instanceof Error
          ? err.message
          : 'Erro ao atualizar empresa',
      valores: payload,
    };
  }
}

/**
 * Busca uma empresa pelo ID do usuário.
 */
export async function getEmpresaByUsuarioId(
  usuarioId: string,
): Promise<EmpresaResponse> {
  try {
    const res = await clientApi(`/petrocarga/empresas/${usuarioId}`);

    if (!res.ok) {
      let msg = 'Erro ao buscar empresa';

      try {
        const err = await res.json();
        msg = err.message ?? msg;
      } catch {}

      return {
        error: true,
        message: msg,
      };
    }

    const empresa = await res.json();

    return {
      error: false,
      empresa,
    };
  } catch (err: unknown) {
    return {
      error: true,
      message:
        err instanceof Error
          ? err.message
          : 'Erro ao buscar empresa',
    };
  }
}

/**
 * Busca os motoristas vinculados à empresa.
 */
export async function getMotoristaEmpresaByUsuarioId(
  usuarioId: string,
  numeroPagina: number = 0,
  tamanhoPagina: number = 10,
  nome?: string,
  ativo?: boolean,
  ordem: 'ASC' | 'DESC' = 'ASC',
): Promise<MotoristaEmpresaResponse> {
  try {
    const params = new URLSearchParams({
      pagina: numeroPagina.toString(),
      tamanhoPagina: tamanhoPagina.toString(),
      ordem,
    });

    if (nome?.trim()) {
      params.append('nome', nome.trim());
    }

    if (ativo !== undefined) {
      params.append('ativo', ativo.toString());
    }

    const res = await clientApi(
      `/petrocarga/motoristas/byEmpresa/${usuarioId}?${params.toString()}`,
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

/**
 * Desvincula um motorista da empresa.
 */
export async function desvincularMotoristaEmpresa(
  usuarioId?: string,
  motoristaId?: string,
) {
  try {
    await clientApi(
      `/petrocarga/motoristas/desvincularEmpresa/${usuarioId}/${motoristaId}`,
      {
        method: 'PATCH',
      },
    );

    return {
      success: true,
    };
  } catch (err: unknown) {
    console.error('Erro ao desvincular motorista:', err);

    throw err;
  }
}

/**
 * Busca os veículos vinculados a um motorista da empresa.
 */
export interface FiltrosVeiculosVinculadosMotorista {
  placa?: string;
  marca?: string;
  modelo?: string;
  tipo?:
    | 'AUTOMOVEL'
    | 'CAMINHONETA'
    | 'VUC'
    | 'CAMINHAO_MEDIO'
    | 'CAMINHAO_LONGO';
  telefoneUsuario?: string;
  cpfProprietario?: string;
  cnpjProprietario?: string;
  ativo?: boolean;
  pagina?: number;
  tamanhoPagina?: number;
  ordem?: 'ASC' | 'DESC';
}

export async function getVeiculosVinculadosMotoristaEmpresa(
  usuarioId: string,
  motoristaId: string,
  filtros: FiltrosVeiculosVinculadosMotorista = {},
): Promise<VeiculoPaginado> {
  try {
    const params = new URLSearchParams();

    if (filtros.placa) {
      params.append('placa', filtros.placa);
    }

    if (filtros.marca) {
      params.append('marca', filtros.marca);
    }

    if (filtros.modelo) {
      params.append('modelo', filtros.modelo);
    }

    if (filtros.tipo) {
      params.append('tipo', filtros.tipo);
    }

    if (filtros.telefoneUsuario) {
      params.append('telefoneUsuario', filtros.telefoneUsuario);
    }

    if (filtros.cpfProprietario) {
      params.append('cpfProprietario', filtros.cpfProprietario);
    }

    if (filtros.cnpjProprietario) {
      params.append('cnpjProprietario', filtros.cnpjProprietario);
    }

    if (filtros.ativo !== undefined) {
      params.append('ativo', String(filtros.ativo));
    }

    params.append('pagina', String(filtros.pagina ?? 0));
    params.append('tamanhoPagina', String(filtros.tamanhoPagina ?? 10));
    params.append('ordem', filtros.ordem ?? 'ASC');

    const res = await clientApi(
      `/petrocarga/veiculoEmpresaMotorista/veiculos/${usuarioId}/${motoristaId}?${params.toString()}`,
    );

    if (!res.ok) {
      throw new Error(`Erro na requisição: ${res.status}`);
    }

    const data = await res.json();

    return {
      content: data.content ?? [],
      totalElementos: data.totalElementos ?? 0,
      totalPaginas: data.totalPaginas ?? 0,
      tamanhoPagina: data.tamanhoPagina ?? filtros.tamanhoPagina ?? 10,
      pagina: data.pagina ?? filtros.pagina ?? 0,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Erro ao buscar veículos vinculados do motorista na empresa.';

    throw new Error(message);
  }
}

/**
 * Vincula um veículo a um motorista da empresa.
 */
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

/**
 * Desvincula um veículo de um motorista da empresa.
 */
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
      message: 'Veículo desvinculado do motorista com sucesso!',
    };
  } catch (err: unknown) {
    return {
      error: true,
      message:
        err instanceof Error
          ? err.message
          : 'Erro ao desvincular veículo do motorista.',
    };
  }
}