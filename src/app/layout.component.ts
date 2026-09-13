import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BreadcrumbComponent } from './shared/breadcrumb/breadcrumb.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';

/**
 * Layout da área autenticada: sidebar à esquerda + breadcrumb no topo.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, BreadcrumbComponent],
  template: `
    <div class="layout">
      <app-sidebar />
      <div class="layout__main">
        <app-breadcrumb />
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
    }

    .layout__content {
      flex: 1;
      padding: 1.5rem;
    }
  `,
})
export class LayoutComponent {}
