import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';

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

  // Create a computed signal for dark mode state - exactly like car-search
  isDarkModeActive = computed(() => this.themeService.darkMode());

  constructor(
    public themeService: ThemeService,
    private router: Router
  ) {
    console.log('WelcomeComponent initialized, dark mode:', this.themeService.darkMode());
  }

  onLogin() {
    console.log('Login attempt:', this.loginData);
    // Implement login logic here
    // After successful login, navigate to search
    this.router.navigate(['/search']);
  }

  onRegister() {
    console.log('Register clicked');
    // Navigate to register page
    this.router.navigate(['/register']);
  }

  toggleDarkMode() {
    console.log('Toggle dark mode clicked, current:', this.themeService.darkMode());
    this.themeService.toggleDarkMode();
    console.log('After toggle:', this.themeService.darkMode());
  }

  isDarkMode() {
    return this.isDarkModeActive();
  }
}
