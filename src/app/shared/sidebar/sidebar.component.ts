import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

/**
 * Menu lateral da área autenticada — item Dashboard + sair.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar__brand">Mirante</div>
      <nav class="sidebar__nav" aria-label="Menu principal">
        <a
          routerLink="/dashboard"
          routerLinkActive="sidebar__item--ativo"
          class="sidebar__item"
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

    .sidebar__brand {
      font-size: 1.25rem;
      font-weight: 700;
      padding: 0 0.5rem;
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
  `,
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  sair(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
