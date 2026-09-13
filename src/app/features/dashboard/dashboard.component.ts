import { Component, inject } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';
import { CurrencyBRLPipe } from '../../shared/pipes/currency.pipe';
import { DateBrPipe } from '../../shared/pipes/date.pipe';

/**
 * Dashboard — primeira tela pós-login (conteúdo de exemplo do MVP).
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyBRLPipe, DateBrPipe],
  template: `
    <section class="dashboard">
      <h1 class="dashboard__titulo">Dashboard</h1>
      <p class="dashboard__sub">
        Bem-vindo, {{ auth.usuario()?.nome ?? 'usuário' }}!
      </p>

      <div class="dashboard__cards">
        <div class="dashboard__card">
          <span class="dashboard__cardLabel">Valor de exemplo</span>
          <strong class="dashboard__cardValor">{{ 1234.5 | brl }}</strong>
        </div>
        <div class="dashboard__card">
          <span class="dashboard__cardLabel">Hoje</span>
          <strong class="dashboard__cardValor">{{ hoje | dataBr }}</strong>
        </div>
      </div>
    </section>
  `,
  styles: `
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .dashboard__titulo {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--texto-primario);
    }

    .dashboard__sub {
      margin: 0 0 1.25rem 0;
      color: var(--texto-secundario);
      font-size: 0.95rem;
    }

    .dashboard__cards {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .dashboard__card {
      background: var(--surface-0);
      border: 1px solid var(--surface-100);
      border-radius: 0.5rem;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 200px;
    }

    .dashboard__cardLabel {
      font-size: 0.8rem;
      color: var(--texto-secundario);
    }

    .dashboard__cardValor {
      font-size: 1.2rem;
      color: var(--petroleo-700);
    }
  `,
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
  readonly hoje = new Date();
}
