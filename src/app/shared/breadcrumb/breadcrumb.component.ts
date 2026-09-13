import { Component, input, output } from '@angular/core';

import { BreadcrumbItem } from '../../core/models/breadcrumb-item.model';

/**
 * Breadcrumb reutilizável, recebido por @Input — quem sabe a rota atual
 * (o LayoutComponent, via `data.breadcrumb` de cada rota) decide os itens.
 */
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  template: `
    <nav class="breadcrumb" aria-label="Navegação de localização">
      @if (showHome()) {
        <a class="breadcrumb__item breadcrumb__item--link" (click)="home.emit()">{{
          homeLabel()
        }}</a>
        @if (items().length) {
          <span class="breadcrumb__sep" aria-hidden="true">/</span>
        }
      }
      @for (item of items(); track item.label; let last = $last) {
        <span class="breadcrumb__item">{{ item.label }}</span>
        @if (!last) {
          <span class="breadcrumb__sep" aria-hidden="true">/</span>
        }
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

    .breadcrumb__item--link {
      cursor: pointer;
      text-decoration: none;
    }

    .breadcrumb__item--link:hover {
      color: var(--texto-primario);
    }

    .breadcrumb__sep {
      color: var(--texto-secundario);
      opacity: 0.6;
    }

    /* Mobile: breadcrumb mais compacto */
    @media (max-width: 768px) {
      .breadcrumb {
        padding: 0.5rem 0.75rem;
        font-size: 0.8rem;
      }
    }
  `,
})
export class BreadcrumbComponent {
  readonly items = input<BreadcrumbItem[]>([]);
  readonly homeLabel = input('Início');
  readonly showHome = input(true);

  readonly home = output<void>();
  readonly itemClick = output<BreadcrumbItem>();
}
