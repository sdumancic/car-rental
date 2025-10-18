import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStore } from '../services/app.store';
import { ThemeService } from '../services/theme.service'

@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-details.component.html',
  styleUrls: ['./reservation-details.component.scss']
})
export class ReservationDetailsComponent {
  // Car details
  carDetails = {
    name: 'Tesla Model 3',
    variant: 'Long Range',
    pricePerDay: 58,
    seats: 5,
    doors: 4,
    transmission: 'Automatic',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCgxWFN9atzz19FGPuHNUSbH6z5Qp__rI32TugB-dAoA8j1itK9Vk1rlBZpfRWTEuZ4mDfobEn897sOFNWJdkLb5_iLu66WyLCCiUm_iF8dog2sKAOz3k_-i0JcNHzla75wQp-EQLuSwyRHe419jgFx2VZfycTWNzd4qhWur8yjcGg-ozgkVAnuXyBLwdf1JAUcenhnN5uZlDLLvxEvCzkSvArWHUVgg1I763zvu9n70cI7o6W6sVOeWNgWfiNcnQR-2eWoydgsI-VP'
    ]
  };

  // Current image index for carousel
  currentImageIndex = signal(0);

  // Reservation details
  reservationData = {
    startDate: '',
    endDate: '',
    rentalDays: 3
  };

  // Cost breakdown
  costBreakdown = computed(() => {
    const days = this.reservationData.rentalDays;
    const subtotal = days * this.carDetails.pricePerDay;
    const taxesAndFees = 25.00;
    const total = subtotal + taxesAndFees;

    return {
      days,
      subtotal,
      taxesAndFees,
      total
    };
  });

  // Create a computed signal for dark mode state
  isDarkModeActive = computed(() => this.themeService.darkMode());

  constructor(
    public themeService: ThemeService,
    private router: Router
  ) {}

  goBack() {
    this.router.navigate(['/search']);
  }

  onReserve() {
    console.log('Reserving car:', this.carDetails);
    console.log('Reservation data:', this.reservationData);
    // Implement reservation logic here
  }

  selectImage(index: number) {
    this.currentImageIndex.set(index);
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  isDarkMode() {
    return this.isDarkModeActive();
  }
}

