export type EnumHistorico = 'Lançamento Manual';

export const HISTORICOS_DISPONIVEIS: EnumHistorico[] = ['Lançamento Manual'];

export type SituacaoLancamento = 'Pendente' | 'Confirmado';

export interface ArquivoAnexo {
  id: number;
  nome: string;
  pathUrl: string;
}

export interface Lancamento {
  id: number;
  contaCorrenteId: number;
  valor: number;
  historico: EnumHistorico;
  estorno: boolean;
  documentos: ArquivoAnexo[];
  descricao: string;
  situacao: SituacaoLancamento;
}

/** Corpo enviado para POST /api/lancamentos. */
export interface IncluirLancamentoPayload {
  contaCorrenteId: number;
  valor: number;
  historico: EnumHistorico;
  estorno: boolean;
  documentos: { nome: string }[];
  descricao: string;
}
