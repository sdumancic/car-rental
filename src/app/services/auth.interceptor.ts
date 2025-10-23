import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Don't add token to login or refresh_token endpoints
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/refresh_token');

  // Clone the request and add authorization header if token exists
  let clonedRequest = req;
  if (token && !isAuthEndpoint) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 errors for non-auth endpoints
      if (error.status === 401 && !isAuthEndpoint) {
        // Try to refresh the token
        return authService.refreshAccessToken().pipe(
          switchMap((response) => {
            // Retry the original request with new token
            const newToken = response.accessToken || authService.getToken();
            const retryRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryRequest);
          }),
          catchError((refreshError) => {
            // If refresh also returns 401, logout and redirect to welcome
            if (refreshError.status === 401) {
              console.log('Refresh token expired, logging out...');
              authService.logout();
              router.navigate(['/welcome']);
            }
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

