import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ContentChild,
  TemplateRef,
  computed,
  input,
  output,
} from '@angular/core';

/**
 * Tabela genérica paginada com seleção (checkbox por linha + "selecionar
 * todos" no cabeçalho, com estado indeterminado quando a seleção é parcial).
 *
 * Quem usa fornece as colunas de cabeçalho e de linha via `<ng-template>`:
 *
 * ```html
 * <app-generic-table [items]="lotes" [trackBy]="loteId" ...>
 *   <ng-template #header>
 *     <th>ID</th>
 *   </ng-template>
 *   <ng-template #row let-item>
 *     <td>{{ item.id }}</td>
 *   </ng-template>
 * </app-generic-table>
 * ```
 */
@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.scss',
})
export class GenericTableComponent<T> {
  readonly items = input<T[]>([]);
  readonly total = input(0);
  readonly page = input(1);
  readonly size = input(10);
  readonly selectedIds = input<Set<number>>(new Set());
  readonly trackBy = input<(item: T) => number>((item) => (item as { id: number }).id);
  readonly emptyMessage = input('Nenhum item encontrado.');

  readonly selectionChange = output<Set<number>>();
  readonly pageChange = output<number>();

  @ContentChild('header', { read: TemplateRef }) headerTemplate?: TemplateRef<unknown>;
  @ContentChild('row', { read: TemplateRef }) rowTemplate?: TemplateRef<{ $implicit: T }>;

  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.size())));

  readonly inicioExibicao = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * this.size() + 1,
  );

  readonly fimExibicao = computed(() => Math.min(this.page() * this.size(), this.total()));

  readonly todosSelecionados = computed(
    () =>
      this.items().length > 0 &&
      this.items().every((item) => this.selectedIds().has(this.trackBy()(item))),
  );

  readonly algumSelecionado = computed(
    () =>
      this.items().some((item) => this.selectedIds().has(this.trackBy()(item))) &&
      !this.todosSelecionados(),
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
      for (const item of this.items()) {
        atual.delete(this.trackBy()(item));
      }
    } else {
      for (const item of this.items()) {
        atual.add(this.trackBy()(item));
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
