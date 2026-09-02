import { clientApi } from '../clientApi';

import type {
  ConviteMotoristaEmpresaPayload,
  ConviteMotoristaEmpresaResult,
  ConviteMotoristaEmpresaPorToken,
  ResponderConviteMotoristaEmpresaPayload,
  ConvitesMotoristaEmpresaResponse,
  ListarConvitesMotoristaEmpresaParams,
  ListarConvitesMotoristaEmpresaPorMotoristaParams,
} from '../../lib/types/conviteMotoristaEmpresa';

/**
 * Gera um convite para um motorista.
 */
export async function gerarConviteMotoristaEmpresa(
  empresaId: string,
  payload: ConviteMotoristaEmpresaPayload,
): Promise<ConviteMotoristaEmpresaResult> {
  try {
    const res = await clientApi(
      `/petrocarga/convite-motorista-empresa/${encodeURIComponent(empresaId)}`,
      {
        method: 'POST',
        json: payload,
      },
    );

    if (!res.ok) {
      let message = 'Erro ao gerar convite para motorista';

      try {
        const error = await res.json();
        message = error.message ?? message;
      } catch {}

      return {
        error: true,
        message,
      };
    }

    return {
      error: false,
      message: 'Convite enviado com sucesso!',
    };
  } catch (err: unknown) {
    return {
      error: true,
      message:
        err instanceof Error
          ? err.message
          : 'Erro ao gerar convite para motorista',
    };
  }
}

/**
 * Busca um convite específico através do token.
 */
export async function buscarConviteMotoristaEmpresaPorToken(
  conviteToken: string,
): Promise<ConviteMotoristaEmpresaPorToken> {
  const res = await clientApi(
    `/petrocarga/convite-motorista-empresa/byToken/${encodeURIComponent(
      conviteToken,
    )}`,
    {
      method: 'GET',
    },
  );

  if (!res.ok) {
    let message = 'Erro ao buscar convite';

    try {
      const error = await res.json();
      message = error.message ?? message;
    } catch {}

    throw new Error(message);
  }

  return res.json();
}

/**
 * Responde a um convite.
 *
 * Se o motorista já possui cadastro:
 *   { conviteToken, status }
 *
 * Se o motorista não possui cadastro:
 *   { conviteToken, status, motorista }
 */
export async function responderConviteMotoristaEmpresa(
  payload: ResponderConviteMotoristaEmpresaPayload,
): Promise<ConviteMotoristaEmpresaResult> {
  try {
    const res = await clientApi(
      '/petrocarga/convite-motorista-empresa/responder',
      {
        method: 'PATCH',
        json: payload,
      },
    );

    if (!res.ok) {
      let message = 'Erro ao responder convite';

      try {
        const error = await res.json();
        message = error.message ?? message;
      } catch {}

      return {
        error: true,
        message,
      };
    }

    return {
      error: false,
      message: 'Convite respondido com sucesso!',
    };
  } catch (err: unknown) {
    return {
      error: true,
      message:
        err instanceof Error
          ? err.message
          : 'Erro ao responder convite',
    };
  }
}

export async function responderConviteMotoristaExistenteEmpresa(
  motoristaId: string,
  payload: ResponderConviteMotoristaEmpresaPayload,
): Promise<ConviteMotoristaEmpresaResult> {
  try {
    const res = await clientApi(
      `/petrocarga/convite-motorista-empresa/responder/${motoristaId}`,
      {
        method: 'PATCH',
        json: payload,
      },
    );

    if (!res.ok) {
      let message = 'Erro ao responder convite';

      try {
        const error = await res.json();
        message = error.message ?? message;
      } catch {}

      return {
        error: true,
        message,
      };
    }

    return {
      error: false,
      message: 'Convite respondido com sucesso!',
    };
  } catch (err: unknown) {
    return {
      error: true,
      message:
        err instanceof Error
          ? err.message
          : 'Erro ao responder convite',
    };
  }
}

/**
 * Lista os convites relacionados à empresa.
 */
export async function listarConvitesMotoristaEmpresaPorEmpresa(
  empresaId: string,
  params: ListarConvitesMotoristaEmpresaParams = {},
): Promise<ConvitesMotoristaEmpresaResponse> {
  const searchParams = new URLSearchParams();

  if (params.listaStatus?.length) {
    params.listaStatus.forEach((status) => {
      searchParams.append('listaStatus', status);
    });
  }

  if (params.nomeMotorista) {
    searchParams.append('nomeMotorista', params.nomeMotorista);
  }

  if (params.emailMotorista) {
    searchParams.append('emailMotorista', params.emailMotorista);
  }

  searchParams.append('pagina', String(params.pagina ?? 0));
  searchParams.append(
    'tamanhoPagina',
    String(params.tamanhoPagina ?? 10),
  );
  searchParams.append('ordem', params.ordem ?? 'DESC');

  const res = await clientApi(
    `/petrocarga/convite-motorista-empresa/byEmpresa/${encodeURIComponent(
      empresaId,
    )}?${searchParams.toString()}`,
    {
      method: 'GET',
    },
  );

  if (!res.ok) {
    let message = 'Erro ao buscar convites da empresa';

    try {
      const error = await res.json();
      message = error.message ?? message;
    } catch {}

    throw new Error(message);
  }

  return res.json();
}

/**
 * Lista os convites recebidos pelo motorista.
 */
export async function listarConvitesMotoristaEmpresaPorMotorista(
  motoristaId: string,
  params: ListarConvitesMotoristaEmpresaPorMotoristaParams = {},
): Promise<ConvitesMotoristaEmpresaResponse> {
  const searchParams = new URLSearchParams();

  if (params.razaoSocial) {
    searchParams.append('razaoSocial', params.razaoSocial);
  }

  if (params.cnpj) {
    searchParams.append('cnpj', params.cnpj);
  }

  if (params.listaStatus?.length) {
    params.listaStatus.forEach((status) => {
      searchParams.append('listaStatus', status);
    });
  }

  searchParams.append('pagina', String(params.pagina ?? 0));
  searchParams.append(
    'tamanhoPagina',
    String(params.tamanhoPagina ?? 10),
  );
  searchParams.append('ordem', params.ordem ?? 'DESC');

  const res = await clientApi(
    `/petrocarga/convite-motorista-empresa/byMotorista/${encodeURIComponent(
      motoristaId,
    )}?${searchParams.toString()}`,
    {
      method: 'GET',
    },
  );

  if (!res.ok) {
    let message = 'Erro ao buscar convites recebidos pelo motorista';

    try {
      const error = await res.json();
      message = error.message ?? message;
    } catch {}

    throw new Error(message);
  }

  return res.json();
}

/**
 * Cancela um convite de vínculo enviado pela empresa.
 */
export async function cancelarConviteMotoristaEmpresa(
  empresaId: string,
  conviteId: string,
): Promise<void> {
  const searchParams = new URLSearchParams();

  searchParams.append('conviteId', conviteId);

  const res = await clientApi(
    `/petrocarga/convite-motorista-empresa/cancelar/${encodeURIComponent(
      empresaId,
    )}?${searchParams.toString()}`,
    {
      method: 'DELETE',
    },
  );

  if (!res.ok) {
    let message = 'Erro ao cancelar convite de vínculo';

    try {
      const error = await res.json();
      message = error.message ?? message;
    } catch {}

    throw new Error(message);
  }
}