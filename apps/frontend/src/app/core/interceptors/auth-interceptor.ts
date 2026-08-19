import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthResponse, AuthService } from '../services/auth.service';

function withAuthHeader<T>(req: HttpRequest<T>, token: string): HttpRequest<T> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

let refreshInProgress$: Observable<AuthResponse> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const isAuthRoute = req.url.includes('/auth/');

  const authorizedReq = token && !isAuthRoute ? withAuthHeader(req, token) : req;

  return next(authorizedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthRoute && authService.getRefreshToken()) {
        if (!refreshInProgress$) {
          refreshInProgress$ = authService.refreshToken().pipe(
            shareReplay(1),
            finalize(() => {
              refreshInProgress$ = null;
            }),
          );
        }

        return refreshInProgress$.pipe(
          switchMap((res) => next(withAuthHeader(req, res.accessToken))),
          catchError((refreshError) => throwError(() => refreshError)),
        );
      }

      return throwError(() => error);
    }),
  );
};
