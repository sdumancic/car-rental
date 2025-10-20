import { Component, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

  // Reservation details using signals
  startDate = signal('');
  endDate = signal('');

  // Computed signal to check if both dates are selected
  areDatesSelected = computed(() => {
    return this.startDate() !== '' && this.endDate() !== '';
  });

  // Computed signal to calculate rental days
  rentalDays = computed(() => {
    if (!this.areDatesSelected()) {
      return 0;
    }

    const start = new Date(this.startDate());
    const end = new Date(this.endDate());
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  });

  // Cost breakdown - only calculate if dates are selected
  costBreakdown = computed(() => {
    if (!this.areDatesSelected()) {
      return { days: 0, subtotal: 0, taxesAndFees: 0, total: 0 };
    }

    const days = this.rentalDays();
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
    private router: Router,
    private location: Location
  ) {}

  goBack() {
    this.location.back();
  }

  onReserve() {
    if (!this.areDatesSelected()) {
      alert('Please select both start and end dates');
      return;
    }

    console.log('Reserving car:', this.carDetails);
    console.log('Start date:', this.startDate());
    console.log('End date:', this.endDate());
    console.log('Days:', this.rentalDays());

    // Navigate to payment page
    this.router.navigate(['/payment']);
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
