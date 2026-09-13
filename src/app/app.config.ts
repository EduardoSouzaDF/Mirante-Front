import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // Formatação pt-BR (moeda e datas) em toda a aplicação.
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
