import { Component, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { VehicleService } from '../services/vehicle.service';

@Component({
  selector: 'app-return-car',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './return-car.component.html',
  styleUrls: ['./return-car.component.scss']
})
export class ReturnCarComponent {
  // Car condition report
  conditionReport = '';

  // Photos object for each position
  photos = {
    front: null as File | null,
    back: null as File | null,
    leftSide: null as File | null,
    rightSide: null as File | null,
    mileage: null as File | null
  };

  // Dialog states
  showSuccessDialog = signal(false);

  // Create a computed signal for dark mode state
  isDarkModeActive = computed(() => this.themeService.darkMode());

  reservationId: string | null = null;

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private vehicleService: VehicleService
  ) {
    this.reservationId = this.route.snapshot.paramMap.get('id');
    console.log('Return Car Component - Reservation ID:', this.reservationId);
  }

  goBack() {
    this.location.back();
  }

  onAddPhoto(position: 'front' | 'back' | 'leftSide' | 'rightSide' | 'mileage') {
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = false;

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0] as File;
      if (file) {
        this.photos[position] = file;
        console.log(`Photo added for ${position}:`, file.name);
      }
    };

    fileInput.click();
  }

  hasPhoto(position: 'front' | 'back' | 'leftSide' | 'rightSide' | 'mileage'): boolean {
    return this.photos[position] !== null;
  }

  async onSubmit() {
    if (!this.reservationId) {
      alert('Reservation ID not found.');
      return;
    }
    try {
      console.log('Submitting return for reservation ID:', this.reservationId);
      await this.vehicleService.completeReservation(Number(this.reservationId)).toPromise();
      console.log('Reservation completed successfully');
      this.showSuccessDialog.set(true);
      setTimeout(() => {
        this.router.navigate(['/my-rentals']);
      }, 2000);
    } catch (error) {
      console.error('Error completing reservation:', error);
      alert('Failed to complete reservation. Please try again.');
    }
  }

  navigateToSearch() {
    this.router.navigate(['/search']);
  }

  navigateToRentals() {
    this.router.navigate(['/return-car']);
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
