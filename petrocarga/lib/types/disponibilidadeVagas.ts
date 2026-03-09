// types/disponibilidade.ts

export type Disponibilidade = {
  id: string;
  vagaId: string;
  endereco: {
    id: string;
    codigoPmp: string;
    logradouro: string;
    bairro: string;
  };
  referenciaEndereco: string;
  numeroEndereco: string;
  inicio: string;
  fim: string;
  criadoEm: string;
  criadoPorId: string;
};

// Pick só os campos necessários para criar/editar
export type DisponibilidadeVaga = Pick<
  Disponibilidade,
  'vagaId' | 'inicio' | 'fim'
> & {
  id?: string;
};

export type DisponibilidadeResponse = {
  error?: boolean;
  message?: string;
  valores?: DisponibilidadeVaga;
  success?: boolean;
};
