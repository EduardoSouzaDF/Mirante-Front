import { Component, inject } from '@angular/core';

import { LoadingService } from '../../core/services/loading.service';

/**
 * Indicador de carregamento minimalista (paleta verde-petróleo).
 * Aparece em overlay enquanto houver requisições HTTP pendentes.
 */
@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  template: `
    @if (loading.carregando()) {
      <div class="loading" role="status" aria-live="polite" aria-label="Carregando">
        <span class="loading__spinner"></span>
      </div>
    }
  `,
  styles: `
    .loading {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--petroleo-950) 35%, transparent);
      z-index: 9999;
    }

    .loading__spinner {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 4px solid var(--surface-100);
      border-top-color: var(--agua-500);
      animation: loading-girar 0.8s linear infinite;
    }

    @keyframes loading-girar {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class LoadingIndicatorComponent {
  readonly loading = inject(LoadingService);
}
