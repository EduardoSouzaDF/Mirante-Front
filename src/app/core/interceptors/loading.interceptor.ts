import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoadingService } from '../services/loading.service';

/**
 * Liga/desliga o indicador de carregamento em toda requisição HTTP.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  loading.iniciar();
  return next(req).pipe(finalize(() => loading.finalizar()));
};
