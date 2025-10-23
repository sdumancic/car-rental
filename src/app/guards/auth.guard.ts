import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AppStore } from '../services/app.store';

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(AppStore);
  const router = inject(Router);

  const userId = store.getUserId();

  // Check if user is authenticated (has userId in store)
  if (userId) {
    return true;
  }

  // Not authenticated, redirect to welcome page
  console.warn('Access denied. Redirecting to login...');
  router.navigate(['/welcome'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

