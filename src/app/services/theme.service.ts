import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Make darkMode public so components can track it
  darkMode = signal<boolean>(this.isDarkModePreferred());

  constructor() {
    // Initialize theme based on user preference or stored value
    this.initializeTheme();
  }

  private isDarkModePreferred(): boolean {
    // Check local storage first
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    // If not in storage, check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private initializeTheme(): void {
    // Set initial theme
    this.updateTheme(this.darkMode());

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (localStorage.getItem('darkMode') === null) {
          this.darkMode.set(e.matches);
          this.updateTheme(e.matches);
        }
      });
  }

  toggleDarkMode(): void {
    const newValue = !this.darkMode();
    this.darkMode.set(newValue);
    this.updateTheme(newValue);
    localStorage.setItem('darkMode', newValue.toString());
  }

  isDarkMode(): boolean {
    return this.darkMode();
  }

  private updateTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
