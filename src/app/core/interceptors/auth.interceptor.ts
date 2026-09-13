import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

/**
 * Envia o token do cookie no header Authorization de toda requisição.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.obterToken();
  if (token) {
    const reqComToken = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(reqComToken);
  }
  return next(req);
};
