import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-my-rentals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-rentals.component.html',
  styleUrls: ['./my-rentals.component.scss']
})
export class MyRentalsComponent {
  // Active rental data
  activeRental = {
    carName: 'Nissan Versa',
    carType: 'or similar',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0HvsG4bHBm9apLu5oQjIKnXDSoosP4LCBIsVvGaCJp6LDHvs3BETBKSCdgXcuvBe004CsEx86ITkBqTHCTlvy286M_qjtsz6QI0zJHUa1ssXAQ6RaQeygKztl091Za85UYbTOnj5GQPwBp4rnevh5eA-Z_losPraHHjGyW6f07ygFL1UkOGfaYAriawrIXMJMn6XeKxzfGCjTzLqcXg2Y5jvGnz4P9baunOZHBoUW8zUv7O9xHlVp-6pQ401G7e_JVTBYlktsIdFH',
    pickupDate: 'May 25, 2024 - 10:00 AM',
    pickupLocation: 'JFK Airport',
    returnDate: 'May 30, 2024 - 10:00 AM',
    returnLocation: 'JFK Airport'
  };

  // Create a computed signal for dark mode state
  isDarkModeActive = computed(() => this.themeService.darkMode());

  constructor(
    public themeService: ThemeService,
    private router: Router
  ) {}

  onViewDetails() {
    console.log('Viewing rental details...');
    // Navigate to rental details page
    // this.router.navigate(['/rental-details']);
  }

  onViewHistory() {
    console.log('Viewing rental history...');
    // Navigate to rental history page
    // this.router.navigate(['/rental-history']);
  }

  onMenuClick() {
    console.log('Menu clicked');
    // Show menu options
  }

  navigateToSearch() {
    this.router.navigate(['/search']);
  }

  navigateToRentals() {
    this.router.navigate(['/my-rentals']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  isDarkMode() {
    return this.isDarkModeActive();
  }
}

