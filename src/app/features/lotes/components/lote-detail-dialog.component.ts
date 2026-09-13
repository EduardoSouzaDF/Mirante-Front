import { Component, effect, inject, input, output, signal } from '@angular/core';

import { LoteDetalhe } from '../../../core/models/lote.model';
import { LoteFacade } from '../../../core/services/lote.facade';
import { CurrencyBRLPipe } from '../../../shared/pipes/currency.pipe';
import { DateBrPipe } from '../../../shared/pipes/date.pipe';

/**
 * Modal de detalhe do lote — carrega `GET /api/lotes/:id` ao abrir.
 * Alterar/Justificativa aqui dentro só disparam o placeholder do mock;
 * a regra de negócio real dessas ações é spec futura.
 */
@Component({
  selector: 'app-lote-detail-dialog',
  standalone: true,
  imports: [CurrencyBRLPipe, DateBrPipe],
  templateUrl: './lote-detail-dialog.component.html',
  styleUrl: './lote-detail-dialog.component.scss',
})
export class LoteDetailDialogComponent {
  private readonly facade = inject(LoteFacade);

  readonly visible = input(false);
  readonly loteId = input<number | null>(null);

  readonly closed = output<void>();
  readonly action = output<'alterar' | 'justificativa'>();

  readonly lote = signal<LoteDetalhe | null>(null);
  readonly carregando = signal(false);

  constructor() {
    effect(() => {
      const id = this.loteId();
      if (this.visible() && id != null) {
        this.carregar(id);
      }
    });
  }

  fechar(): void {
    this.lote.set(null);
    this.closed.emit();
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.facade.carregarLoteId(id).subscribe({
      next: (lote) => {
        this.lote.set(lote);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }
}
