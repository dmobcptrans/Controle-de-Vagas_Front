/**
 * @module types/veiculo
 * @description Definições de tipos TypeScript para o módulo de Veículos.
 *
 * ----------------------------------------------------------------------------
 * 📋 TIPOS DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. Veiculo - Representação completa de um veículo no sistema
 * 2. VeiculoAPI - Versão simplificada para comunicação com APIs externas
 */

/**
 * @type Veiculo
 * @description Representação completa de um veículo no sistema.
 * Contém todas as informações necessárias para identificação e classificação.
 *
 * @property {string} id - ID único do veículo
 * @property {string} placa - Placa do veículo (formato: ABC1234)
 * @property {string} marca - Marca do veículo (ex: 'Fiat', 'Volkswagen')
 * @property {string} modelo - Modelo do veículo (ex: 'Uno', 'Gol')
 *
 * @property {'AUTOMOVEL' | 'VUC' | 'CAMINHONETA' | 'CAMINHAO_MEDIO' | 'CAMINHAO_LONGO'} tipo - Tipo do veículo
 *   - AUTOMOVEL: Carro de passeio comum
 *   - VUC: Veículo Urbano de Carga
 *   - CAMINHONETA: Picapes e utilitários
 *   - CAMINHAO_MEDIO: Caminhões de médio porte
 *   - CAMINHAO_LONGO: Caminhões de grande porte (carreta)
 *
 * @property {string} [usuarioId] - ID do usuário proprietário (opcional)
 * @property {string | null} [cpfProprietario] - CPF do proprietário (pessoa física)
 * @property {string | null} [cnpjProprietario] - CNPJ do proprietário (pessoa jurídica)
 *
 * @example
 * ```ts
 * const veiculo: Veiculo = {
 *   id: 'veic123',
 *   placa: 'ABC1234',
 *   marca: 'Fiat',
 *   modelo: 'Uno',
 *   tipo: 'AUTOMOVEL',
 *   usuarioId: 'user456',
 *   cpfProprietario: '12345678900',
 *   cnpjProprietario: null
 * };
 * ```
 */
export type Veiculo = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  tipo:
    | 'AUTOMOVEL'
    | 'VUC'
    | 'CAMINHONETA'
    | 'CAMINHAO_MEDIO'
    | 'CAMINHAO_LONGO';
  usuarioId?: string;
  cpfProprietario?: string | null;
  cnpjProprietario?: string | null;
};

/**
 * @type VeiculoAPI
 * @description Versão simplificada do veículo para comunicação com APIs externas.
 * Usada quando apenas informações básicas são necessárias.
 *
 * @property {string} id - ID único do veículo
 * @property {string} name - Nome/descrição do veículo (ex: "Fiat Uno")
 * @property {string} plate - Placa do veículo (formato internacional)
 *
 * @example
 * ```ts
 * // Exemplo de resposta de API externa
 * const veiculoExterno: VeiculoAPI = {
 *   id: 'ext123',
 *   name: 'Fiat Uno 1.0',
 *   plate: 'ABC1234'
 * };
 *
 * // Conversão para o formato interno
 * const veiculoInterno: Veiculo = {
 *   id: veiculoExterno.id,
 *   placa: veiculoExterno.plate,
 *   name: veiculoExterno.name, // precisaria ser parseado
 *   // ... outros campos
 * };
 * ```
 */
export type VeiculoAPI = {
  id: string;
  name: string;
  plate: string;
};
