import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStore } from '../services/app.store';

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

  // Inject the store
  isDarkMode: any;

  constructor(
    private store: AppStore,
    private router: Router
  ) {
    this.isDarkMode = this.store.isDarkMode;
  }

  onLogin() {
    console.log('Login attempt:', this.loginData);
    // Implement login logic here
    // After successful login, navigate to my-rentals
    this.router.navigate(['/my-rentals']);
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
