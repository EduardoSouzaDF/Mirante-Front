import { Component, input, output } from '@angular/core';

export type EscopoAcao = 'pagina' | 'todos';

/**
 * Perguntado quando o usuário clica em Confirmar/Enviar/Visualizar
 * Justificativa sem nenhum lote selecionado: aplica a ação só nos lotes
 * desta página, ou em todos os lotes do filtro atual (todas as páginas)?
 */
@Component({
  selector: 'app-scope-confirm-dialog',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="scope-dialog__overlay" (click)="cancelado.emit()" aria-hidden="true"></div>
      <div class="scope-dialog" role="dialog" aria-modal="true" aria-label="Escolher escopo da ação">
        <p class="scope-dialog__texto">
          Aplicar "{{ acaoLabel() }}" para quais lotes?
        </p>
        <div class="scope-dialog__acoes">
          <button type="button" class="scope-dialog__opcao" (click)="escolha.emit('pagina')">
            Somente os lotes desta página
          </button>
          @if (mostrarTodos()) {
            <button type="button" class="scope-dialog__opcao" (click)="escolha.emit('todos')">
              Todos os lotes (todas as páginas)
            </button>
          }
          <button type="button" class="scope-dialog__cancelar" (click)="cancelado.emit()">
            Cancelar
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    .scope-dialog__overlay {
      position: fixed;
      inset: 0;
      background: color-mix(in srgb, var(--petroleo-950) 45%, transparent);
      z-index: 200;
    }

    .scope-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 201;
      background: var(--surface-0);
      border-radius: 0.5rem;
      padding: 1.25rem;
      width: min(90vw, 420px);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .scope-dialog__texto {
      margin: 0;
      color: var(--texto-primario);
      font-size: 0.95rem;
    }

    .scope-dialog__acoes {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .scope-dialog__opcao {
      padding: 0.6rem 0.9rem;
      border: 1px solid var(--surface-100);
      background: var(--agua-500);
      color: var(--surface-0);
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .scope-dialog__opcao:hover {
      background: var(--agua-600);
    }

    .scope-dialog__cancelar {
      padding: 0.6rem 0.9rem;
      border: 1px solid var(--surface-100);
      background: var(--surface-50);
      color: var(--texto-primario);
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.85rem;
    }
  `,
})
export class ScopeConfirmDialogComponent {
  readonly visible = input(false);
  readonly acaoLabel = input('');
  readonly mostrarTodos = input(false);

  readonly escolha = output<EscopoAcao>();
  readonly cancelado = output<void>();
}
