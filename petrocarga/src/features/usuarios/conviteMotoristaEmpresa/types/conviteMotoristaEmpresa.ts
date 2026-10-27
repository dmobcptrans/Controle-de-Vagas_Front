export type StatusConviteMotoristaEmpresa = 'PENDENTE' | 'ACEITO' | 'RECUSADO';

/**
 * Payload utilizado para gerar um convite.
 */
export type ConviteMotoristaEmpresaPayload = {
  emailMotorista: string;
  nomeMotorista: string;
};

/**
 * Dados do motorista enviados quando ele ainda não possui cadastro.
 */
export type MotoristaConviteCadastro = {
  nome: string;
  telefone: string;
  cpf: string;
  numeroCnh: string;
  tipoCnh: string;
  dataValidadeCnh: string;
  senha: string;
};

/**
 * Payload para responder a um convite quando
 * o motorista ainda não possui cadastro.
 */
export type ResponderConviteMotoristaEmpresaComCadastroPayload = {
  conviteId: string;
  status: StatusConviteMotoristaEmpresa;
};

/**
 * Payload para responder a um convite quando
 * o motorista já possui cadastro.
 */
export type ResponderConviteMotoristaEmpresaSemCadastroPayload = {
  conviteToken: string;
  status: StatusConviteMotoristaEmpresa;
  motorista: MotoristaConviteCadastro;
};

/**
 * Payload completo utilizado pelo endpoint de resposta.
 *
 * - Motorista sem cadastro: envia token + status + dados do motorista.
 * - Motorista já cadastrado: envia apenas token + status.
 */
export type ResponderConviteMotoristaEmpresaPayload =
  | ResponderConviteMotoristaEmpresaComCadastroPayload
  | ResponderConviteMotoristaEmpresaSemCadastroPayload;

/**
 * Retorno padrão das operações de convite.
 */
export type ConviteMotoristaEmpresaResult = {
  error: boolean;
  message: string;
};

/**
 * Dados retornados ao consultar um convite específico pelo token.
 */
export type ConviteMotoristaEmpresaPorToken = {
  razaoSocial: string;
  motoristaNome: string;
  motoristaEmail: string;
  motoristaJaCadastrado: boolean;
  status: StatusConviteMotoristaEmpresa;
  criadoEm: string;
  respondidoEm: string | null;
};

/**
 * Convite completo.
 */
export type ConviteMotoristaEmpresa = {
  id: string;
  conviteToken: string;
  empresaId: string;
  razaoSocial: string;
  motoristaId: string | null;
  motoristaNome: string;
  motoristaEmail: string;
  status: StatusConviteMotoristaEmpresa;
  criadoEm: string;
  respondidoEm: string | null;
};

/**
 * Item retornado nas listagens de convites.
 *
 * O backend atualmente retorna essa estrutura tanto
 * para empresa quanto para motorista.
 */
export type ConviteMotoristaEmpresaListaItem = {
  id: string ;
  conviteToken: string;
  razaoSocial: string;
  motoristaNome: string;
  motoristaEmail: string;
  motoristaJaCadastrado: boolean;
  status: StatusConviteMotoristaEmpresa;
  criadoEm: string;
  respondidoEm: string | null;
};

/**
 * Resposta paginada de convites.
 */
export type ConvitesMotoristaEmpresaResponse = {
  content: ConviteMotoristaEmpresaListaItem[];
  totalElementos: number;
  totalPaginas: number;
  tamanhoPagina: number;
  pagina: number;
};

/**
 * Parâmetros para listar convites da empresa.
 */
export type ListarConvitesMotoristaEmpresaParams = {
  listaStatus?: StatusConviteMotoristaEmpresa[];
  nomeMotorista?: string;
  emailMotorista?: string;
  pagina?: number;
  tamanhoPagina?: number;
  ordem?: 'ASC' | 'DESC';
};

/**
 * Parâmetros para listar convites recebidos pelo motorista.
 */
export type ListarConvitesMotoristaEmpresaPorMotoristaParams = {
  razaoSocial?: string;
  cnpj?: string;
  listaStatus?: StatusConviteMotoristaEmpresa[];
  pagina?: number;
  tamanhoPagina?: number;
  ordem?: 'ASC' | 'DESC';
};
