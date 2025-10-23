import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStore } from '../services/app.store';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {
  loginData = {
    email: '',
    password: ''
  };

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Inject the store
  isDarkMode: any;

  constructor(
    private store: AppStore,
    private router: Router,
    private authService: AuthService
  ) {
    this.isDarkMode = this.store.isDarkMode;

    // Redirect to search if user is already logged in
    const userId = this.authService.getUserId();
    if (userId) {
      this.router.navigate(['/search']);
    }
  }

  onLogin() {
    // Validate inputs
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage.set('Please enter both username and password');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Use email as username for the API
    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);

        // Fetch user details by username to get user ID
        // AuthService will automatically store userId in AppStore via tap operator
        this.authService.getUserByUsername(this.loginData.email).subscribe({
          next: (user) => {
            console.log('User details fetched:', user);

            // Fetch user roles after getting user details
            this.authService.getUserRoles().subscribe({
              next: (rolesResponse) => {
                console.log('User roles fetched:', rolesResponse);
                this.isLoading.set(false);

                // Navigate based on user role
                if (rolesResponse && rolesResponse.roles) {
                  if (rolesResponse.roles.includes('admin')) {
                    console.log('User is admin, redirecting to admin-car-overview');
                    this.router.navigate(['/admin-car-overview']);
                  } else if (rolesResponse.roles.includes('user')) {
                    console.log('User is regular user, redirecting to my-rentals');
                    this.router.navigate(['/my-rentals']);
                  } else {
                    // Fallback to search if no recognized role
                    console.log('No recognized role, redirecting to search');
                    this.router.navigate(['/search']);
                  }
                } else {
                  // Fallback if no roles in response
                  this.router.navigate(['/search']);
                }
              },
              error: (error) => {
                console.error('Failed to fetch user roles:', error);
                this.isLoading.set(false);
                // Still navigate to search even if roles fetch fails
                this.router.navigate(['/search']);
              }
            });
          },
          error: (error) => {
            console.error('Failed to fetch user details:', error);
            this.isLoading.set(false);
            // Still navigate even if user fetch fails, as login was successful
            this.router.navigate(['/search']);
          }
        });
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isLoading.set(false);

        // Set appropriate error message
        if (error.status === 401) {
          this.errorMessage.set('Invalid username or password');
        } else if (error.status === 0) {
          this.errorMessage.set('Cannot connect to server. Please try again later.');
        } else {
          this.errorMessage.set('Login failed. Please try again.');
        }
      }
    });
  }

  onRegister() {
    console.log('Register clicked');
    // Navigate to register page
    this.router.navigate(['/register']);
  }

  toggleDarkMode() {
    this.store.toggleDarkMode();
  }

  isDarkModeActive() {
    return this.isDarkMode();
  }
}
