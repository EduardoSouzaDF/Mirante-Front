import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LotesPageComponent } from './features/lotes/lotes-page.component';
import { LayoutComponent } from './layout.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Login' },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Dashboard',
        data: { breadcrumb: 'Dashboard' },
      },
      {
        path: 'lotes',
        component: LotesPageComponent,
        title: 'Outros Créditos/Débitos',
        data: { breadcrumb: 'Outros Créditos/Débitos' },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
