import { Lancamento } from './lancamento.model';

export type SituacaoLote = 'Aberto' | 'Confirmado' | 'Enviado';

export interface Instituicao {
  id: string;
  nome: string;
}

export interface Usuario {
  id: string;
  nome: string;
}

export interface Lote {
  id: number;
  resp: Instituicao | null;
  instituicao: Instituicao | null;
  usuarioRegistro: Usuario | null;
  usuarioAprovacao: Usuario | null;
  situacao: SituacaoLote;
  dataEntrada: string;
  dataHoraSituacao: string;
  // valor/quantidadeLancamentos não vêm mais prontos do backend (spec
  // 0005) — sempre calculados a partir de `lancamentos`, ver
  // calcularValorLote()/calcularQuantidadeLancamentos() abaixo.
  lancamentos: Lancamento[];
}

/** @deprecated Lote já tem `lancamentos`; era usado quando só o detalhe trazia. */
export type LoteDetalhe = Lote;

/** Somatório do valor dos lançamentos do lote. */
export function calcularValorLote(lote: Pick<Lote, 'lancamentos'>): number {
  return lote.lancamentos.reduce((soma, l) => soma + l.valor, 0);
}

/** Quantidade de lançamentos do lote. */
export function calcularQuantidadeLancamentos(lote: Pick<Lote, 'lancamentos'>): number {
  return lote.lancamentos.length;
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
