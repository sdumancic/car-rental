import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AppStore } from '../services/app.store';
import { AuthService } from '../services/auth.service';

export const userAuthGuard: CanActivateFn = async (route, state) => {
  const store = inject(AppStore);
  const router = inject(Router);
  const authService = inject(AuthService);

  let userId = store.getUserId();
  const token = authService.getToken();

  console.log("UserAuthGuard: Checking access for userId:", userId, "token:", token);

  // If userId is null but we have a token, try to restore user session
  if (!userId && token) {
    console.log("UserAuthGuard: UserId is null but token exists. Attempting to restore session...");

    try {
      // Get username from localStorage
      const username = localStorage.getItem('username');

      if (username) {
        // Fetch user details to restore userId
        const user = await authService.getUserByUsername(username).toPromise();

        if (user && user.id) {
          // Fetch roles to restore them as well
          await authService.getUserRoles().toPromise();

          // Now userId should be set in store
          userId = store.getUserId();
          console.log("UserAuthGuard: Session restored. UserId:", userId);
        }
      }
    } catch (error) {
      console.error("UserAuthGuard: Failed to restore session:", error);
      // Token might be invalid, redirect to login
      router.navigate(['/welcome'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }
  }

  // Check if user is authenticated (has userId in store)
  if (!userId) {
    console.warn('UserAuthGuard: Access denied. User not authenticated. Redirecting to login...');
    router.navigate(['/welcome'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Check if user has 'user' role
  const hasUserRole = store.hasRole('user');

  if (hasUserRole) {
    return true;
  }

  // User doesn't have required role
  console.warn('UserAuthGuard: Access denied. User does not have required role.');
  router.navigate(['/welcome']);
  return false;
};

