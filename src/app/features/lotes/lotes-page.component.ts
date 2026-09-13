import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { FiltroLote } from '../../core/models/lote.model';
import { LoteFacade } from '../../core/services/lote.facade';
import { FilterPanelComponent } from '../../shared/filter-panel/filter-panel.component';
import { LoteTableComponent } from '../../shared/lote-table/lote-table.component';
import { LoteActionsComponent, LoteAcao } from './components/lote-actions.component';
import { LoteDetailDialogComponent } from './components/lote-detail-dialog.component';

/**
 * Tela "Outros Créditos/Débitos" — pesquisar, listar, selecionar e agir
 * sobre lotes (spec 0004).
 */
@Component({
  selector: 'app-lotes-page',
  standalone: true,
  imports: [
    FilterPanelComponent,
    LoteTableComponent,
    LoteActionsComponent,
    LoteDetailDialogComponent,
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

  constructor() {
    this.facade.carregarFiltros();
    this.facade.pesquisar({});
  }

  onPesquisar(filtro: FiltroLote): void {
    this.facade.pesquisar(filtro);
  }

  onAction(acao: LoteAcao): void {
    const ids = Array.from(this.selectedIds());

    switch (acao) {
      case 'incluir':
        this.facade.incluir().subscribe();
        break;
      case 'alterar':
      case 'visualizar':
        this.loteSelecionadoId.set(ids[0] ?? null);
        this.modalVisivel.set(true);
        break;
      case 'confirmar':
        ids.forEach((id) => this.facade.confirmar(id).subscribe());
        break;
      case 'enviar':
        ids.forEach((id) => this.facade.enviar(id).subscribe());
        break;
      case 'excluir':
        ids.forEach((id) => this.facade.excluir(id).subscribe());
        break;
      case 'justificativa':
        ids.forEach((id) => this.facade.justificativa(id).subscribe());
        break;
    }
  }

  onFecharModal(): void {
    this.modalVisivel.set(false);
    this.loteSelecionadoId.set(null);
  }

  onModalAction(acao: 'alterar' | 'justificativa'): void {
    const id = this.loteSelecionadoId();
    if (id == null) return;
    if (acao === 'justificativa') {
      this.facade.justificativa(id).subscribe();
    }
    this.onFecharModal();
  }
}
