export type SecaoTutorial = {
  id: string;
  titulo: string;
  icone: React.ElementType;
  descricao: string;
  conteudo?: string[];
  passos?: string[];
  dicas?: string[];
};

export type Persona = 'motorista' | 'agente' | 'gestor';

export interface PropsTutorial {
  secoes: SecaoTutorial[];
  persona: Persona;
  linkVoltar: string;
  textoLinkVoltar: string;
  tituloHeader: string;
  subtituloHeader: string;
  tituloBoasVindas: string;
  descricaoBoasVindas: string;
  tituloCTA: string;
  descricaoCTA: string;
  linkBotaoPrimario: string;
  textoBotaoPrimario: string;
  iconeBotaoPrimario?: React.ElementType;
  linkBotaoSecundario: string;
  textoBotaoSecundario: string;
  iconeBotaoSecundario?: React.ElementType;
}
