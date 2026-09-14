import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import {
  FiltroLote,
  Lote,
  SituacaoLote,
  calcularQuantidadeLancamentos,
  calcularValorLote,
} from '../../core/models/lote.model';
import { LoteFacade } from '../../core/services/lote.facade';
import { AvisoToastComponent, TipoAviso } from '../../shared/aviso-toast/aviso-toast.component';
import { FilterPanelComponent } from '../../shared/filter-panel/filter-panel.component';
import { GenericTableComponent } from '../../shared/generic-table/generic-table.component';
import { CurrencyBRLPipe } from '../../shared/pipes/currency.pipe';
import { DateBrPipe } from '../../shared/pipes/date.pipe';
import { DateHoraBrPipe } from '../../shared/pipes/datetime.pipe';
import { RangeFieldComponent, RangeFieldValue } from '../../shared/range-field/range-field.component';
import { IncluirLancamentoDialogComponent } from './components/incluir-lancamento-dialog.component';
import { LoteActionsComponent, LoteAcao } from './components/lote-actions.component';
import { LoteDetailDialogComponent } from './components/lote-detail-dialog.component';
import { EscopoAcao, ScopeConfirmDialogComponent } from './components/scope-confirm-dialog.component';

type AcaoEmMassa = 'confirmar' | 'enviar' | 'justificativa';

const ACAO_LABEL: Record<AcaoEmMassa, string> = {
  confirmar: 'Confirmar',
  enviar: 'Enviar',
  justificativa: 'Visualizar Justificativa',
};

// Confirmar só faz sentido para lotes Abertos; Enviar só para Confirmados.
// Justificativa não tem restrição de situação.
const SITUACAO_EXIGIDA: Partial<Record<AcaoEmMassa, SituacaoLote>> = {
  confirmar: 'Aberto',
  enviar: 'Confirmado',
};

/**
 * Tela "Outros Créditos/Débitos" — pesquisar, listar, selecionar e agir
 * sobre lotes (spec 0004).
 */
@Component({
  selector: 'app-lotes-page',
  standalone: true,
  imports: [
    FormsModule,
    FilterPanelComponent,
    RangeFieldComponent,
    GenericTableComponent,
    CurrencyBRLPipe,
    DateBrPipe,
    DateHoraBrPipe,
    LoteActionsComponent,
    LoteDetailDialogComponent,
    ScopeConfirmDialogComponent,
    IncluirLancamentoDialogComponent,
    AvisoToastComponent,
  ],
  templateUrl: './lotes-page.component.html',
  styleUrl: './lotes-page.component.scss',
})
export class LotesPageComponent {
  protected readonly facade = inject(LoteFacade);

  protected readonly filtrosOptions = toSignal(this.facade.filtrosOptions$, { initialValue: null });
  protected readonly lotes = toSignal(this.facade.lotes$, { initialValue: [] });
  protected readonly total = toSignal(this.facade.total$, { initialValue: 0 });
  protected readonly page = toSignal(this.facade.page$, { initialValue: 1 });
  protected readonly size = toSignal(this.facade.size$, { initialValue: 10 });
  protected readonly selectedIds = toSignal(this.facade.selectedIds$, { initialValue: new Set<number>() });
  protected readonly selectionMode = toSignal(this.facade.selectionMode$, { initialValue: 'none' as const });

  protected readonly modalVisivel = signal(false);
  protected readonly loteSelecionadoId = signal<number | null>(null);

  protected readonly incluirModalVisivel = signal(false);

  protected readonly avisoVisivel = signal(false);
  protected readonly avisoTitulo = signal('');
  protected readonly avisoMensagem = signal('');
  protected readonly avisoTipo = signal<TipoAviso>('success');

  protected readonly calcularValorLote = calcularValorLote;
  protected readonly calcularQuantidadeLancamentos = calcularQuantidadeLancamentos;

  // Modal de escopo: Confirmar/Enviar/Justificativa sem seleção perguntam se
  // é só para os lotes desta página ou para todos os lotes do filtro atual.
  protected readonly escopoModalVisivel = signal(false);
  private readonly acaoPendenteEscopo = signal<AcaoEmMassa | null>(null);
  protected readonly acaoPendenteLabel = computed(() => {
    const acao = this.acaoPendenteEscopo();
    return acao ? ACAO_LABEL[acao] : '';
  });
  protected readonly mostrarOpcaoTodos = computed(() => this.total() > this.lotes().length);

  /** trackBy do generic-table: extrai o id de um Lote. */
  protected readonly loteId = (lote: Lote): number => lote.id;

  // Estado dos filtros — antes vivia no FilterPanelComponent; migrou pra cá
  // porque os campos do formulário agora são projetados por esta tela.
  protected instituicaoRespId = '';
  protected instituicaoId = '';
  protected situacao: FiltroLote['situacao'] = 'Todas';

  private idFaixa: RangeFieldValue = { de: null, ate: null };
  private valorFaixa: RangeFieldValue = { de: null, ate: null };
  private dataFaixa: RangeFieldValue = { de: null, ate: null };

  constructor() {
    this.facade.carregarFiltros();
    // Não chama facade.pesquisar({}) aqui: assinar lotes$/total$ (via
    // toSignal, nos campos acima) já dispara a busca inicial sozinho —
    // o BehaviorSubject de consulta reemite o valor padrão {filtro:{},
    // page:1} assim que alguém assina. Chamar pesquisar({}) de novo aqui
    // só duplicava a primeira requisição GET /api/lotes.
  }

  onIdChange(valor: RangeFieldValue): void {
    this.idFaixa = valor;
  }

  onValorChange(valor: RangeFieldValue): void {
    this.valorFaixa = valor;
  }

  onDataChange(valor: RangeFieldValue): void {
    this.dataFaixa = valor;
  }

  onPesquisar(): void {
    this.facade.pesquisar({
      instituicaoRespId: this.instituicaoRespId || undefined,
      instituicaoId: this.instituicaoId || undefined,
      situacao: this.situacao,
      idDe: this.idFaixa.de != null ? Number(this.idFaixa.de) : undefined,
      idAte: this.idFaixa.ate != null ? Number(this.idFaixa.ate) : undefined,
      valorDe: this.valorFaixa.de != null ? Number(this.valorFaixa.de) : undefined,
      valorAte: this.valorFaixa.ate != null ? Number(this.valorFaixa.ate) : undefined,
      dataDe: this.dataFaixa.de != null ? String(this.dataFaixa.de) : undefined,
      dataAte: this.dataFaixa.ate != null ? String(this.dataFaixa.ate) : undefined,
    });
  }

  onAction(acao: LoteAcao): void {
    const ids = Array.from(this.selectedIds());

    switch (acao) {
      case 'incluir':
        this.incluirModalVisivel.set(true);
        return;
      case 'alterar':
      case 'visualizar':
        this.loteSelecionadoId.set(ids[0] ?? null);
        this.modalVisivel.set(true);
        return;
      case 'excluir':
        ids.forEach((id) => this.facade.excluir(id).subscribe());
        return;
      case 'confirmar':
      case 'enviar':
      case 'justificativa':
        if (ids.length > 0) {
          const selecionados = this.lotes().filter((lote) => this.selectedIds().has(lote.id));
          this.aplicarAcaoEmLotes(acao, this.filtrarPorSituacaoExigida(acao, selecionados));
        } else {
          this.acaoPendenteEscopo.set(acao);
          this.escopoModalVisivel.set(true);
        }
        return;
    }
  }

  onEscopoEscolhido(escopo: EscopoAcao): void {
    const acao = this.acaoPendenteEscopo();
    this.fecharEscopoModal();
    if (!acao) return;

    if (escopo === 'pagina') {
      this.aplicarAcaoEmLotes(acao, this.filtrarPorSituacaoExigida(acao, this.lotes()));
    } else {
      this.facade.listarTodosLotesFiltroAtual().subscribe((lotes) => {
        this.aplicarAcaoEmLotes(acao, this.filtrarPorSituacaoExigida(acao, lotes));
      });
    }
  }

  onEscopoCancelado(): void {
    this.fecharEscopoModal();
  }

  onFecharModal(): void {
    this.modalVisivel.set(false);
    this.loteSelecionadoId.set(null);
  }

  onFecharIncluirModal(): void {
    this.incluirModalVisivel.set(false);
  }

  onLancamentoIncluido(): void {
    this.avisoTitulo.set('Sucesso');
    this.avisoMensagem.set('Lançamento incluído com sucesso.');
    this.avisoTipo.set('success');
    this.avisoVisivel.set(true);
  }

  onAvisoFechado(): void {
    this.avisoVisivel.set(false);
  }

  onModalAction(acao: 'alterar' | 'justificativa'): void {
    const id = this.loteSelecionadoId();
    if (id == null) return;
    if (acao === 'justificativa') {
      this.facade.justificativaEmMassa([id]).subscribe();
    }
    this.onFecharModal();
  }

  private fecharEscopoModal(): void {
    this.escopoModalVisivel.set(false);
    this.acaoPendenteEscopo.set(null);
  }

  /**
   * Confirmar só considera lotes Abertos; Enviar só considera Confirmados
   * — dentro do conjunto que o usuário escolheu (seleção manual ou escopo
   * da modal). Justificativa não filtra por situação.
   */
  private filtrarPorSituacaoExigida(acao: AcaoEmMassa, lotes: Lote[]): number[] {
    const situacaoExigida = SITUACAO_EXIGIDA[acao];
    const filtrados = situacaoExigida
      ? lotes.filter((lote) => lote.situacao === situacaoExigida)
      : lotes;
    return filtrados.map((lote) => lote.id);
  }

  /** Uma única chamada HTTP por ação, com todos os ids selecionados/escopo. */
  private aplicarAcaoEmLotes(acao: AcaoEmMassa, ids: number[]): void {
    if (ids.length === 0) return;
    switch (acao) {
      case 'confirmar':
        this.facade.confirmarEmMassa(ids).subscribe();
        break;
      case 'enviar':
        this.facade.enviarEmMassa(ids).subscribe();
        break;
      case 'justificativa':
        this.facade.justificativaEmMassa(ids).subscribe();
        break;
    }
  }
}
