import { Component, computed, input, output } from '@angular/core';

import { Lote } from '../../core/models/lote.model';
import { CurrencyBRLPipe } from '../pipes/currency.pipe';
import { DateBrPipe } from '../pipes/date.pipe';

/**
 * Tabela paginada de lotes com seleção (checkbox por linha + "selecionar
 * todos" no cabeçalho, com estado indeterminado quando a seleção é parcial).
 */
@Component({
  selector: 'app-lote-table',
  standalone: true,
  imports: [CurrencyBRLPipe, DateBrPipe],
  templateUrl: './lote-table.component.html',
  styleUrl: './lote-table.component.scss',
})
export class LoteTableComponent {
  readonly lotes = input<Lote[]>([]);
  readonly total = input(0);
  readonly page = input(1);
  readonly size = input(10);
  readonly selectedIds = input<Set<number>>(new Set());

  readonly selectionChange = output<Set<number>>();
  readonly pageChange = output<number>();

  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.size())));

  readonly inicioExibicao = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * this.size() + 1,
  );

  readonly fimExibicao = computed(() =>
    Math.min(this.page() * this.size(), this.total()),
  );

  readonly todosSelecionados = computed(
    () => this.lotes().length > 0 && this.lotes().every((l) => this.selectedIds().has(l.id)),
  );

  readonly algumSelecionado = computed(
    () => this.lotes().some((l) => this.selectedIds().has(l.id)) && !this.todosSelecionados(),
  );

  toggleLinha(id: number): void {
    const atual = new Set(this.selectedIds());
    if (atual.has(id)) {
      atual.delete(id);
    } else {
      atual.add(id);
    }
    this.selectionChange.emit(atual);
  }

  toggleTodos(): void {
    const atual = new Set(this.selectedIds());
    if (this.todosSelecionados()) {
      for (const lote of this.lotes()) {
        atual.delete(lote.id);
      }
    } else {
      for (const lote of this.lotes()) {
        atual.add(lote.id);
      }
    }
    this.selectionChange.emit(atual);
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.pageChange.emit(pagina);
    }
  }

  paginas(): number[] {
    return Array.from({ length: this.totalPaginas() }, (_, i) => i + 1);
  }
}
