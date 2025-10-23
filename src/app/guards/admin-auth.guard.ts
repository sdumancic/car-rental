import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AppStore } from '../services/app.store';
import { AuthService } from '../services/auth.service';

export const adminAuthGuard: CanActivateFn = async (route, state) => {
  const store = inject(AppStore);
  const router = inject(Router);
  const authService = inject(AuthService);

  let userId = store.getUserId();
  const token = authService.getToken();

  console.log("AdminAuthGuard: Checking access for userId:", userId, "token:", token);

  // If userId is null but we have a token, try to restore user session
  if (!userId && token) {
    console.log("AdminAuthGuard: UserId is null but token exists. Attempting to restore session...");

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
          console.log("AdminAuthGuard: Session restored. UserId:", userId);
        }
      }
    } catch (error) {
      console.error("AdminAuthGuard: Failed to restore session:", error);
      // Token might be invalid, redirect to login
      router.navigate(['/welcome'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }
  }

  // Check if user is authenticated (has userId in store)
  if (!userId) {
    console.warn('AdminAuthGuard: Access denied. User not authenticated. Redirecting to login...');
    router.navigate(['/welcome'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Check if user has 'admin' role
  const isAdmin = store.hasRole('admin');

  if (isAdmin) {
    return true;
  }

  // User doesn't have admin role
  console.warn('AdminAuthGuard: Access denied. User is not an admin. Redirecting to search...');
  router.navigate(['/search']);
  return false;
};

