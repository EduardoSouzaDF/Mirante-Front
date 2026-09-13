import { Component, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

/**
 * Menu lateral da área autenticada — item Dashboard + sair.
 * No mobile (<= 768px) vira um drawer: abre/fecha via propriedade `aberto`.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.sidebar--aberto]="aberto()">
      <div class="sidebar__topo">
        <div class="sidebar__brand">Mirante</div>
        <button
          type="button"
          class="sidebar__fechar"
          (click)="fechar.emit()"
          aria-label="Fechar menu"
        >
          ✕
        </button>
      </div>
      <nav class="sidebar__nav" aria-label="Menu principal">
        <a
          routerLink="/dashboard"
          routerLinkActive="sidebar__item--ativo"
          class="sidebar__item"
          (click)="fechar.emit()"
        >
          Dashboard
        </a>
      </nav>
      <button type="button" class="sidebar__sair" (click)="sair()">Sair</button>
    </aside>
  `,
  styles: `
    .sidebar {
      width: 240px;
      min-height: 100vh;
      background: var(--petroleo-700);
      color: var(--surface-0);
      display: flex;
      flex-direction: column;
      padding: 1.25rem 1rem;
      gap: 1.5rem;
    }

    .sidebar__topo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .sidebar__brand {
      font-size: 1.25rem;
      font-weight: 700;
      padding: 0 0.5rem;
    }

    .sidebar__fechar {
      display: none;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      color: var(--surface-0);
      font-size: 1rem;
      cursor: pointer;
      border-radius: 0.375rem;
    }

    .sidebar__fechar:hover {
      background: var(--petroleo-600);
    }

    .sidebar__nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .sidebar__item {
      color: var(--surface-0);
      text-decoration: none;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.95rem;
    }

    .sidebar__item:hover {
      background: var(--petroleo-600);
    }

    .sidebar__item--ativo {
      background: var(--agua-500);
      font-weight: 600;
    }

    .sidebar__sair {
      margin-top: auto;
      background: transparent;
      border: 1px solid var(--petroleo-400);
      color: var(--surface-0);
      padding: 0.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .sidebar__sair:hover {
      background: var(--petroleo-600);
    }

    /* Mobile: sidebar vira drawer deslizante */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        z-index: 100;
        min-height: 100vh;
        box-shadow: 0 0 24px color-mix(in srgb, var(--petroleo-950) 45%, transparent);
      }

      .sidebar--aberto {
        transform: translateX(0);
      }

      .sidebar__fechar {
        display: inline-flex;
      }
    }
  `,
})
export class SidebarComponent {
  /** Estado do drawer no mobile (ignorado no desktop). */
  readonly aberto = input(false);

  /** Emitido quando o menu deve fechar (✕ ou clique num item). */
  readonly fechar = output<void>();

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  sair(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
