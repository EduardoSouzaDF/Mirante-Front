import { Injectable, computed, signal } from '@angular/core';

/**
 * Contador de requisições em andamento — usado pelo loading-indicator.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly pendentes = signal(0);

  readonly carregando = computed(() => this.pendentes() > 0);

  iniciar(): void {
    this.pendentes.update((total) => total + 1);
  }

  finalizar(): void {
    this.pendentes.update((total) => Math.max(0, total - 1));
  }
}
