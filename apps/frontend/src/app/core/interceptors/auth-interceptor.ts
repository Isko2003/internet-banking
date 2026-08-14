import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

function withAuthHeader(req: any, token: string) {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const isAuthRoute = req.url.includes('/auth/');

  const authorizedReq = token && !isAuthRoute ? withAuthHeader(req, token) : req;

  return next(authorizedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthRoute && authService.getRefreshToken()) {
        return authService.refreshToken().pipe(
          switchMap((res) => next(withAuthHeader(req, res.accessToken))),
          catchError((refreshError) => throwError(() => refreshError)),
        );
      }

      return throwError(() => error);
    }),
  );
};
