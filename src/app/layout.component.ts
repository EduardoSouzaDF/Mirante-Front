import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { BreadcrumbItem } from './core/models/breadcrumb-item.model';
import { BreadcrumbComponent } from './shared/breadcrumb/breadcrumb.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';

/**
 * Layout da área autenticada: sidebar à esquerda + breadcrumb no topo.
 * No mobile (<= 768px) a sidebar vira drawer, aberta pelo botão ☰.
 * O breadcrumb é montado a partir de `data.breadcrumb` da rota ativa.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, BreadcrumbComponent],
  template: `
    <div class="layout">
      <app-sidebar [aberto]="menuAberto()" (fechar)="fecharMenu()" />

      @if (menuAberto()) {
        <div
          class="layout__overlay"
          (click)="fecharMenu()"
          aria-hidden="true"
        ></div>
      }

      <div class="layout__main">
        <div class="layout__topbar">
          <button
            type="button"
            class="layout__menuBotao"
            (click)="alternarMenu()"
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <app-breadcrumb
            [items]="breadcrumbItems()"
            (home)="irParaInicio()"
          />
        </div>
        <main class="layout__content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      min-height: 100vh;
    }

    .layout__main {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--surface-ground);
      min-width: 0;
    }

    .layout__topbar {
      display: flex;
      align-items: center;
      background: var(--surface-0);
      border-bottom: 1px solid var(--surface-100);
    }

    .layout__content {
      flex: 1;
      padding: 1.5rem;
    }

    .layout__menuBotao {
      display: none;
    }

    .layout__overlay {
      display: none;
    }

    /* Mobile: botão ☰ + overlay do drawer */
    @media (max-width: 768px) {
      .layout__menuBotao {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
        margin-left: 0.5rem;
        font-size: 1.25rem;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--petroleo-700);
      }

      .layout__overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: color-mix(in srgb, var(--petroleo-950) 40%, transparent);
        z-index: 90;
      }

      .layout__content {
        padding: 1rem;
      }
    }
  `,
})
export class LayoutComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly menuAberto = signal(false);
  readonly breadcrumbItems = signal<BreadcrumbItem[]>(this.lerBreadcrumb());

  constructor() {
    this.router.events
      .pipe(filter((evento) => evento instanceof NavigationEnd))
      .subscribe(() => this.breadcrumbItems.set(this.lerBreadcrumb()));
  }

  alternarMenu(): void {
    this.menuAberto.set(!this.menuAberto());
  }

  fecharMenu(): void {
    this.menuAberto.set(false);
  }

  irParaInicio(): void {
    this.router.navigate(['/dashboard']);
  }

  private lerBreadcrumb(): BreadcrumbItem[] {
    let atual = this.route.firstChild;
    while (atual?.firstChild) {
      atual = atual.firstChild;
    }
    const label = atual?.snapshot?.data?.['breadcrumb'];
    return label ? [{ label }] : [];
  }
}
