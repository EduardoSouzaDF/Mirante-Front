import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Breadcrumbs derivados da URL atual (ex.: Início / Dashboard).
 * Usa a nova sintaxe de control flow (@for) do Angular 17.
 */
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  template: `
    <nav class="breadcrumb" aria-label="Navegação de localização">
      <span class="breadcrumb__item">Início</span>
      @for (item of itens(); track item) {
        <span class="breadcrumb__sep" aria-hidden="true">/</span>
        <span class="breadcrumb__item">{{ item }}</span>
      }
    </nav>
  `,
  styles: `
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-size: 0.875rem;
      color: var(--texto-secundario);
      background: var(--surface-0);
      border-bottom: 1px solid var(--surface-100);
    }

    .breadcrumb__item {
      color: var(--texto-secundario);
    }

    .breadcrumb__sep {
      color: var(--texto-secundario);
      opacity: 0.6;
    }
  `,
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);

  readonly itens = signal<string[]>(this.extrair(this.router.url));

  constructor() {
    this.router.events
      .pipe(filter((evento) => evento instanceof NavigationEnd))
      .subscribe(() => {
        this.itens.set(this.extrair(this.router.url));
      });
  }

  private extrair(url: string): string[] {
    const segmentos = url.split('?')[0].split('/').filter(Boolean);
    return segmentos.map(
      (segmento) => segmento.charAt(0).toUpperCase() + segmento.slice(1),
    );
  }
}
