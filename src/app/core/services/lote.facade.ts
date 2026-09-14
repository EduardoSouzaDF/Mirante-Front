import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

import { ContaCorrenteBusca } from '../models/conta-corrente.model';
import { IncluirLancamentoPayload } from '../models/lancamento.model';
import {
  FiltroLote,
  FiltrosLoteOpcoes,
  Lote,
  LoteDetalhe,
  PaginatedResponse,
} from '../models/lote.model';

export type SelectionMode = 'none' | 'one' | 'many';

interface ConsultaState {
  filtro: FiltroLote;
  page: number;
  size: number;
}

const FILTROS_FALLBACK: FiltrosLoteOpcoes = {
  instituicoes: [{ id: '0001', nome: '0001 - SICOOB' }],
  instituicoesResponsaveis: [{ id: '0001', nome: '0001 - SICOOB' }],
  situacoes: ['Aberto', 'Confirmado', 'Enviado'],
};

const RESULTADO_VAZIO: PaginatedResponse<Lote> = {
  data: [],
  total: 0,
  page: 1,
  size: 10,
  hasNext: false,
  hasPrevious: false,
};

/**
 * Estado e chamadas HTTP da tela "Outros Créditos/Débitos" (Consultar Lotes).
 * As telas consomem via `async` pipe — nunca chamam HttpClient diretamente.
 */
@Injectable({ providedIn: 'root' })
export class LoteFacade {
  private readonly http = inject(HttpClient);

  // Filtro + paginação vivem num único subject: pesquisar()/irParaPagina()
  // trocam os dois campos de uma vez só, sem disparar uma busca intermediária
  // com filtro novo e página antiga (ou vice-versa).
  private readonly consultaSubject = new BehaviorSubject<ConsultaState>({
    filtro: {},
    page: 1,
    size: 10,
  });
  private readonly recarregarSubject = new Subject<void>();
  private readonly selectedIdsSubject = new BehaviorSubject<Set<number>>(new Set());
  private readonly filtrosOptionsSubject = new ReplaySubject<FiltrosLoteOpcoes>(1);

  readonly filtrosOptions$ = this.filtrosOptionsSubject.asObservable();
  readonly page$ = this.consultaSubject.pipe(
    map((s) => s.page),
    distinctUntilChanged(),
  );
  readonly size$ = this.consultaSubject.pipe(
    map((s) => s.size),
    distinctUntilChanged(),
  );
  readonly selectedIds$ = this.selectedIdsSubject.asObservable();

  readonly selectionMode$: Observable<SelectionMode> = this.selectedIds$.pipe(
    map((ids) => (ids.size === 0 ? 'none' : ids.size === 1 ? 'one' : 'many')),
  );

  private readonly resultado$: Observable<PaginatedResponse<Lote>> = combineLatest([
    this.consultaSubject,
    this.recarregarSubject.pipe(startWith(undefined)),
  ]).pipe(
    switchMap(([{ filtro, page, size }]) => this.buscar(filtro, page, size)),
    shareReplay(1),
  );

  readonly lotes$ = this.resultado$.pipe(map((r) => r.data));
  readonly total$ = this.resultado$.pipe(map((r) => r.total));

  carregarFiltros(): void {
    this.http
      .get<FiltrosLoteOpcoes>('/api/filtros/lotes')
      .pipe(catchError(() => of(FILTROS_FALLBACK)))
      .subscribe((opcoes) => this.filtrosOptionsSubject.next(opcoes));
  }

  pesquisar(filtro: FiltroLote): void {
    this.consultaSubject.next({ ...this.consultaSubject.value, filtro, page: 1 });
    this.limparSelecao();
  }

  irParaPagina(pagina: number): void {
    this.consultaSubject.next({ ...this.consultaSubject.value, page: pagina });
  }

  setSelecionados(ids: Set<number>): void {
    this.selectedIdsSubject.next(ids);
  }

  limparSelecao(): void {
    this.selectedIdsSubject.next(new Set());
  }

  carregarLoteId(id: number): Observable<LoteDetalhe> {
    return this.http.get<LoteDetalhe>(`/api/lotes/${id}`);
  }

  /**
   * Todos os lotes que batem com o filtro atual, ignorando paginação.
   * Devolve o Lote inteiro (não só o id) para quem chama poder filtrar por
   * situação antes de aplicar uma ação em massa.
   */
  listarTodosLotesFiltroAtual(): Observable<Lote[]> {
    const { filtro } = this.consultaSubject.value;
    return this.buscar(filtro, 1, 100000).pipe(map((r) => r.data));
  }

  /** Confirma todos os ids passados numa única chamada HTTP. */
  confirmarEmMassa(ids: number[]): Observable<{ lotes: Lote[] }> {
    return this.http
      .post<{ lotes: Lote[] }>('/api/lotes/confirmar', { ids })
      .pipe(tap(() => this.recarregarSubject.next()));
  }

  /** Envia todos os ids passados numa única chamada HTTP. */
  enviarEmMassa(ids: number[]): Observable<{ lotes: Lote[] }> {
    return this.http
      .post<{ lotes: Lote[] }>('/api/lotes/enviar', { ids })
      .pipe(tap(() => this.recarregarSubject.next()));
  }

  excluir(id: number): Observable<void> {
    return this.http.post<void>(`/api/lotes/${id}/excluir`, {}).pipe(
      tap(() => {
        this.recarregarSubject.next();
        this.limparSelecao();
      }),
    );
  }

  /** Busca conta corrente por número (aceita "agencia-conta" ou só a conta). */
  buscarContaCorrente(numero: string): Observable<ContaCorrenteBusca> {
    return this.http.get<ContaCorrenteBusca>('/api/contas-correntes', {
      params: { numero },
    });
  }

  /** Lista todas as contas correntes (pro select pesquisável de Incluir Lançamento). */
  listarContasCorrentes(): Observable<ContaCorrenteBusca[]> {
    return this.http
      .get<{ contas: ContaCorrenteBusca[] }>('/api/contas-correntes')
      .pipe(map((r) => r.contas));
  }

  /** Cria o lançamento e o lote novo (Aberto) para a instituição da conta. */
  incluirLancamento(payload: IncluirLancamentoPayload): Observable<Lote> {
    return this.http
      .post<Lote>('/api/lancamentos', payload)
      .pipe(tap(() => this.recarregarSubject.next()));
  }

  /** Justificativa (placeholder) para todos os ids passados numa única chamada. */
  justificativaEmMassa(ids: number[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/lotes/justificativa', { ids });
  }

  private buscar(filtro: FiltroLote, page: number, size: number): Observable<PaginatedResponse<Lote>> {
    let params = new HttpParams().set('page', page).set('size', size);
    for (const [chave, valor] of Object.entries(filtro)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(chave, String(valor));
      }
    }
    return this.http.get<PaginatedResponse<Lote>>('/api/lotes', { params }).pipe(
      catchError(() => of({ ...RESULTADO_VAZIO, page, size })),
    );
  }
}
