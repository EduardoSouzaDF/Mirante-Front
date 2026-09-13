import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FiltroLote, FiltrosLoteOpcoes } from '../../core/models/lote.model';
import { RangeFieldComponent, RangeFieldValue } from '../range-field/range-field.component';

/**
 * Painel de filtros recolhível da tela "Outros Créditos/Débitos".
 */
@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [FormsModule, RangeFieldComponent],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss',
})
export class FilterPanelComponent {
  readonly opcoes = input<FiltrosLoteOpcoes | null>(null);
  readonly pesquisar = output<FiltroLote>();

  readonly expandido = signal(true);

  protected instituicaoRespId = '';
  protected instituicaoId = '';
  protected situacao: FiltroLote['situacao'] = 'Todas';

  private idFaixa: RangeFieldValue = { de: null, ate: null };
  private valorFaixa: RangeFieldValue = { de: null, ate: null };
  private dataFaixa: RangeFieldValue = { de: null, ate: null };

  alternar(): void {
    this.expandido.set(!this.expandido());
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
    this.pesquisar.emit({
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
}
