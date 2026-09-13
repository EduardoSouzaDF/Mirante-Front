import { Component, computed, input, output } from '@angular/core';

export type SelectionMode = 'none' | 'one' | 'many';
export type LoteAcao =
  | 'confirmar'
  | 'enviar'
  | 'justificativa'
  | 'incluir'
  | 'alterar'
  | 'excluir'
  | 'visualizar';

interface BotaoAcao {
  acao: LoteAcao;
  label: string;
  icone: string;
}

const BOTOES: BotaoAcao[] = [
  { acao: 'confirmar', label: 'Confirmar', icone: 'pi-check' },
  { acao: 'enviar', label: 'Enviar', icone: 'pi-send' },
  { acao: 'justificativa', label: 'Visualizar Justificativa', icone: 'pi-file' },
  { acao: 'incluir', label: 'Incluir', icone: 'pi-plus' },
  { acao: 'alterar', label: 'Alterar', icone: 'pi-pencil' },
  { acao: 'excluir', label: 'Excluir', icone: 'pi-trash' },
  { acao: 'visualizar', label: 'Visualizar', icone: 'pi-eye' },
];

/**
 * Barra de ações sobre a listagem de lotes. Habilitação por botão depende
 * de quantos lotes estão selecionados (`selectionMode`).
 */
@Component({
  selector: 'app-lote-actions',
  standalone: true,
  template: `
    <div class="lote-actions">
      @for (botao of botoes; track botao.acao) {
        <button
          type="button"
          class="lote-actions__botao"
          [disabled]="!habilitado(botao.acao)"
          (click)="action.emit(botao.acao)"
        >
          <i class="pi" [class]="botao.icone"></i>
          {{ botao.label }}
        </button>
      }
    </div>
  `,
  styles: `
    .lote-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .lote-actions__botao {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 2px 10px;
      background: var(--surface-50);
      border: 1px solid var(--surface-100);
      border-radius: 0.375rem;
      font-size: 0.8rem;
      color: var(--texto-primario);
      cursor: pointer;
    }

    .lote-actions__botao:hover:not(:disabled) {
      background: var(--surface-100);
    }

    .lote-actions__botao:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `,
})
export class LoteActionsComponent {
  readonly selectionMode = input<SelectionMode>('none');
  readonly action = output<LoteAcao>();

  protected readonly botoes = BOTOES;

  private readonly precisaUm = computed(() => this.selectionMode() === 'one');
  private readonly precisaAoMenosUm = computed(() => this.selectionMode() !== 'none');

  habilitado(acao: LoteAcao): boolean {
    if (acao === 'incluir') return true;
    if (acao === 'alterar' || acao === 'visualizar') return this.precisaUm();
    return this.precisaAoMenosUm();
  }
}
