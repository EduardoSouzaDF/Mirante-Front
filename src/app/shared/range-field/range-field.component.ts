import { Component, input, output, signal } from '@angular/core';

export interface RangeFieldValue {
  de: string | number | null;
  ate: string | number | null;
}

/**
 * Campo "De/Até" reutilizável (numérico, data ou moeda BRL com máscara).
 * Usado nos filtros de ID Lote, Valor Lote e Data Entrada.
 */
@Component({
  selector: 'app-range-field',
  standalone: true,
  template: `
    <div class="range-field">
      <label class="range-field__label">{{ label() }}</label>
      <div class="range-field__inputs">
        <input
          class="range-field__input"
          [type]="inputType()"
          [attr.inputmode]="inputMode()"
          [attr.min]="deMin()"
          [attr.step]="type() === 'number' ? 1 : null"
          [placeholder]="placeholderDe() || 'De'"
          [attr.aria-label]="label() + ' - De'"
          [value]="deExibicao()"
          (input)="onDe($event)"
          (click)="abrirSeletor($event)"
        />
        <input
          class="range-field__input"
          [type]="inputType()"
          [attr.inputmode]="inputMode()"
          [attr.min]="ateMin()"
          [attr.step]="type() === 'number' ? 1 : null"
          [placeholder]="placeholderAte() || 'Até'"
          [attr.aria-label]="label() + ' - Até'"
          [value]="ateExibicao()"
          (input)="onAte($event)"
          (click)="abrirSeletor($event)"
        />
      </div>
    </div>
  `,
  styles: `
    .range-field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 0;
    }

    .range-field__label {
      font-size: 0.8rem;
      color: var(--texto-secundario);
    }

    .range-field__inputs {
      display: flex;
      gap: 0.5rem;
    }

    .range-field__input {
      flex: 1;
      min-width: 0;
      padding: 0.4rem 0.5rem;
      border: 1px solid var(--surface-100);
      border-radius: 0.375rem;
      font-size: 0.85rem;
      color: var(--texto-primario);
    }

    .range-field__input:focus {
      outline: none;
      border-color: var(--agua-500);
    }
  `,
})
export class RangeFieldComponent {
  readonly label = input('');
  readonly type = input<'number' | 'date' | 'currency'>('number');
  readonly placeholderDe = input('');
  readonly placeholderAte = input('');

  readonly change = output<RangeFieldValue>();

  private readonly deValor = signal<string | number | null>(null);
  private readonly ateValor = signal<string | number | null>(null);

  readonly deExibicao = signal('');
  readonly ateExibicao = signal('');

  readonly inputType = () => {
    if (this.type() === 'date') return 'date';
    if (this.type() === 'number') return 'number';
    return 'text';
  };

  readonly inputMode = () => {
    if (this.type() === 'currency' || this.type() === 'number') return 'numeric';
    return null;
  };

  /** ID Lote não faz sentido negativo — trava o mínimo em 0 nos dois campos. */
  readonly deMin = () => (this.type() === 'number' ? 0 : null);

  readonly ateMin = () => {
    if (this.type() === 'number') return 0;
    const valor = this.deValor();
    return this.type() === 'date' && valor ? String(valor) : null;
  };

  abrirSeletor(evento: Event): void {
    const input = evento.target as HTMLInputElement & { showPicker?: () => void };
    if (this.type() === 'date') {
      input.showPicker?.();
    }
  }

  onDe(evento: Event): void {
    const bruto = (evento.target as HTMLInputElement).value;
    const { exibicao, valor } = this.processar(bruto);
    this.deExibicao.set(exibicao);
    this.deValor.set(valor);
    this.emitir();
  }

  onAte(evento: Event): void {
    const bruto = (evento.target as HTMLInputElement).value;
    const { exibicao, valor } = this.processar(bruto);
    this.ateExibicao.set(exibicao);
    this.ateValor.set(valor);
    this.emitir();
  }

  private processar(bruto: string): { exibicao: string; valor: string | number | null } {
    if (this.type() === 'currency') {
      const digitos = bruto.replace(/\D/g, '');
      if (!digitos) {
        return { exibicao: '', valor: null };
      }
      const numero = Number(digitos) / 100;
      return {
        exibicao: numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        valor: numero,
      };
    }
    if (this.type() === 'number') {
      if (!bruto) {
        return { exibicao: '', valor: null };
      }
      const numero = Number(bruto.replace(/\D/g, ''));
      return { exibicao: bruto.replace(/\D/g, ''), valor: Number.isFinite(numero) ? numero : null };
    }
    return { exibicao: bruto, valor: bruto || null };
  }

  private emitir(): void {
    this.change.emit({ de: this.deValor(), ate: this.ateValor() });
  }
}
