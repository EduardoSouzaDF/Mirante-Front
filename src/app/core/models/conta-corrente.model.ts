import { Instituicao } from './lote.model';

export interface ContaCorrente {
  id: number;
  agencia: number;
  conta: number;
  instituicaoId: string;
}

export interface ContaCorrenteBusca {
  conta: ContaCorrente;
  instituicao: Instituicao | null;
}
