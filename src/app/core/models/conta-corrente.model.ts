export interface ContaCorrente {
  id: number;
  agencia: number;
  conta: number;
  instituicaoId: string;
}

// Instituicao mora aqui (não em lote.model.ts) porque ela referencia
// ContaCorrente — lote.model.ts reexporta pra manter compatibilidade.
export interface Instituicao {
  id: string;
  nome: string;
  /** Contas correntes da instituição — vem incluso no GET /api/lotes (spec 0005). */
  contasCorrentes?: ContaCorrente[];
}

export interface ContaCorrenteBusca {
  conta: ContaCorrente;
  instituicao: Instituicao | null;
}
