export type SituacaoLote = 'Aberto' | 'Confirmado' | 'Enviado';

export interface Instituicao {
  id: string;
  nome: string;
}

export interface Usuario {
  id: string;
  nome: string;
}

export interface Lancamento {
  id: number;
  descricao: string;
  valor: number;
}

export interface Lote {
  id: number;
  resp: Instituicao | null;
  instituicao: Instituicao | null;
  valor: number;
  quantidadeLancamentos: number;
  usuarioRegistro: Usuario | null;
  usuarioAprovacao: Usuario | null;
  situacao: SituacaoLote;
  dataEntrada: string;
  dataHoraSituacao: string;
}

export interface LoteDetalhe extends Lote {
  lancamentos: Lancamento[];
}

export interface FiltroLote {
  instituicaoRespId?: string;
  instituicaoId?: string;
  situacao?: SituacaoLote | 'Todas';
  idDe?: number;
  idAte?: number;
  valorDe?: number;
  valorAte?: number;
  dataDe?: string;
  dataAte?: string;
}

export interface FiltrosLoteOpcoes {
  instituicoes: Instituicao[];
  instituicoesResponsaveis: Instituicao[];
  situacoes: SituacaoLote[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
