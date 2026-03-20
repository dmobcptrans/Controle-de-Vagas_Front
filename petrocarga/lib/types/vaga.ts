// types/vaga.ts

/**
 * @module types/vaga
 * @description Definições de tipos TypeScript para o módulo de Vagas.
 *
 * ----------------------------------------------------------------------------
 * 📋 TIPOS DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. DiaSemana - Dias da semana em formato enum
 * 2. OperacoesVaga - Horários de operação por dia
 * 3. Endereco - Endereço da vaga
 * 4. VagaPayload - Dados para criação/atualização
 * 5. Vaga - Vaga completa
 * 6. VagaResponse - Resposta padronizada da API
 * 7. FiltrosVaga - Parâmetros para filtragem
 * 8. ApiError - Estrutura de erro
 */

/**
 * @type DiaSemana
 * @description Dias da semana em formato de enumeração.
 * Usado para definir os dias de operação das vagas.
 */
export type DiaSemana =
  | 'DOMINGO'
  | 'SEGUNDA'
  | 'TERCA'
  | 'QUARTA'
  | 'QUINTA'
  | 'SEXTA'
  | 'SABADO';

/**
 * @interface OperacoesVaga
 * @description Define os horários de operação de uma vaga para um dia específico.
 *
 * @property {string} [id] - ID da operação (opcional, usado em edições)
 * @property {number} [codigoDiaSemana] - Código numérico do dia (1-7)
 * @property {DiaSemana} diaSemanaAsEnum - Dia da semana em formato enum
 * @property {string} horaInicio - Hora de início no formato "HH:MM:SS"
 * @property {string} horaFim - Hora de fim no formato "HH:MM:SS"
 *
 * @example
 * ```ts
 * const operacao: OperacoesVaga = {
 *   codigoDiaSemana: 2,
 *   diaSemanaAsEnum: 'SEGUNDA',
 *   horaInicio: '08:00:00',
 *   horaFim: '18:00:00'
 * };
 * ```
 */
export interface OperacoesVaga {
  id?: string;
  codigoDiaSemana?: number;
  diaSemanaAsEnum: DiaSemana;
  horaInicio: string; // ex: "00:00:00"
  horaFim: string; // ex: "13:00:00"
}

/**
 * @interface Endereco
 * @description Endereço completo da vaga.
 *
 * @property {string} [id] - ID do endereço (opcional)
 * @property {string} codigoPmp - Código PMP da rua (ex: "Md-1234")
 * @property {string} logradouro - Nome da rua/avenida
 * @property {string} bairro - Bairro da vaga
 */
export interface Endereco {
  id?: string;
  codigoPmp: string;
  logradouro: string;
  bairro: string;
}

/**
 * @interface VagaPayload
 * @description Payload para criação/atualização de vaga.
 * Usa FormDataEntryValue | null porque vem diretamente do FormData.
 *
 * @property {Object} endereco - Dados do endereço
 * @property {FormDataEntryValue | null} endereco.codigoPmp - Código PMP
 * @property {FormDataEntryValue | null} endereco.logradouro - Logradouro
 * @property {FormDataEntryValue | null} endereco.bairro - Bairro
 * @property {string} area - Área da vaga (vermelha, amarela, etc.)
 * @property {FormDataEntryValue | null} numeroEndereco - Números de referência
 * @property {FormDataEntryValue | null} referenciaEndereco - Pontos de referência
 * @property {string} tipoVaga - Tipo (paralela, perpendicular)
 * @property {string} status - Status da vaga
 * @property {FormDataEntryValue | null} referenciaGeoInicio - Coordenadas início
 * @property {FormDataEntryValue | null} referenciaGeoFim - Coordenadas fim
 * @property {number} comprimento - Comprimento em metros
 * @property {Array} operacoesVaga - Horários de operação por dia
 */
export interface VagaPayload {
  endereco: {
    codigoPmp: FormDataEntryValue | null;
    logradouro: FormDataEntryValue | null;
    bairro: FormDataEntryValue | null;
  };
  area: string;
  numeroEndereco: FormDataEntryValue | null;
  referenciaEndereco: FormDataEntryValue | null;
  tipoVaga: string;
  status: string;
  referenciaGeoInicio: FormDataEntryValue | null;
  referenciaGeoFim: FormDataEntryValue | null;
  comprimento: number;
  operacoesVaga: Array<{
    codigoDiaSemana?: number;
    horaInicio: string;
    horaFim: string;
    diaSemanaAsEnum?: DiaSemana;
  }>;
}

/**
 * @interface Vaga
 * @description Representação completa de uma vaga no sistema.
 *
 * @property {string} id - ID único da vaga
 * @property {string} area - Área (ex: 'VERMELHA', 'AMARELA')
 * @property {string} numeroEndereco - Números de referência
 * @property {string} referenciaEndereco - Pontos de referência
 * @property {string} tipoVaga - Tipo (ex: 'PARALELA', 'PERPENDICULAR')
 * @property {string} referenciaGeoInicio - Coordenadas de início
 * @property {string} referenciaGeoFim - Coordenadas de fim
 * @property {number} comprimento - Comprimento em metros
 * @property {string} status - Status (ex: 'DISPONIVEL', 'OCUPADO')
 * @property {OperacoesVaga[]} operacoesVaga - Horários de operação
 * @property {Endereco} endereco - Endereço completo
 *
 * @example
 * ```ts
 * const vaga: Vaga = {
 *   id: 'vaga123',
 *   area: 'VERMELHA',
 *   numeroEndereco: '90 ao 130',
 *   referenciaEndereco: 'Em frente à praça',
 *   tipoVaga: 'PARALELA',
 *   referenciaGeoInicio: '-23.55052, -46.633308',
 *   referenciaGeoFim: '-23.55053, -46.633309',
 *   comprimento: 10,
 *   status: 'DISPONIVEL',
 *   operacoesVaga: [{
 *     codigoDiaSemana: 2,
 *     diaSemanaAsEnum: 'SEGUNDA',
 *     horaInicio: '08:00:00',
 *     horaFim: '18:00:00'
 *   }],
 *   endereco: {
 *     id: 'end123',
 *     codigoPmp: 'Md-1234',
 *     logradouro: 'Rua do Imperador',
 *     bairro: 'Centro'
 *   }
 * };
 * ```
 */
export interface Vaga {
  id: string;
  area: 'VERMELHA' | 'AMARELA' | 'AZUL' | 'BRANCA' | string;
  numeroEndereco: string;
  referenciaEndereco: string;
  tipoVaga: 'PARALELA' | 'PERPENDICULAR' | string;
  referenciaGeoInicio: string;
  referenciaGeoFim: string;
  comprimento: number;
  status: 'DISPONIVEL' | 'OCUPADO' | 'MANUTENCAO' | 'INDISPONIVEL' | string;
  operacoesVaga: OperacoesVaga[];
  endereco: Endereco;
}

/**
 * @interface VagaResponse
 * @description Resposta padronizada das APIs de vaga.
 *
 * @property {boolean} error - Indica se houve erro
 * @property {string} [message] - Mensagem descritiva
 * @property {VagaPayload | null} [valores] - Valores enviados (em caso de erro)
 * @property {T} [vaga] - Objeto vaga único
 * @property {T[]} [vagas] - Lista de vagas
 *
 * @template T - Tipo da vaga (padrão: Vaga | VagaPayload)
 */
export interface VagaResponse<T = Vaga | VagaPayload> {
  error: boolean;
  message?: string;
  valores?: VagaPayload | null;
  vaga?: T;
  vagas?: T[];
}

/**
 * @interface FiltrosVaga
 * @description Parâmetros opcionais para filtrar listas de vagas.
 *
 * @property {string} [status] - Filtrar por status
 * @property {string} [area] - Filtrar por área
 * @property {string} [tipoVaga] - Filtrar por tipo
 * @property {string} [bairro] - Filtrar por bairro
 */
export interface FiltrosVaga {
  status?: string;
  area?: string;
  tipoVaga?: string;
  bairro?: string;
}

/**
 * @interface ApiError
 * @description Estrutura padronizada para erros da API.
 *
 * @property {number} [status] - Código HTTP do erro
 * @property {string} message - Mensagem de erro
 */
export interface ApiError {
  status?: number;
  message: string;
}
