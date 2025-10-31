import { Component, signal, computed, NgZone } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { VehicleService } from '../services/vehicle.service';
import { AuthService } from '../services/auth.service';

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

  // Preview URLs for uploaded images - using signal for change detection
  photoPreviewUrls = signal<{
    front: string | null;
    back: string | null;
    leftSide: string | null;
    rightSide: string | null;
    mileage: string | null;
  }>({
    front: null,
    back: null,
    leftSide: null,
    rightSide: null,
    mileage: null
  });

  // Dialog states
  showSuccessDialog = signal(false);
  isSubmitting = signal(false);

  // Create a computed signal for dark mode state
  isDarkModeActive = computed(() => this.themeService.darkMode());

  reservationId: string | null = null;
  reservationData: any = null;

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private vehicleService: VehicleService,
    private ngZone: NgZone,
    private authService: AuthService
  ) {
    this.reservationId = this.route.snapshot.paramMap.get('id');
    console.log('Return Car Component - Reservation ID:', this.reservationId);

    // Load reservation data to get vehicleId
    if (this.reservationId) {
      this.loadReservationData();
    }
  }

  async loadReservationData() {
    try {
      // Get reservation details from vehicle service
      const userId = this.getUserId();
      const response = await this.vehicleService.getUserReservations({
        userId: userId,
        page: 0,
        size: 100
      }).toPromise();

      if (response && response.data) {
        const reservation = response.data.find((r: any) => r.id.toString() === this.reservationId);
        if (reservation) {
          this.reservationData = reservation;
          console.log('Loaded reservation data:', this.reservationData);
        }
      }
    } catch (error) {
      console.error('Error loading reservation data:', error);
    }
  }

  private getUserId(): number {
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        return userData.id || userData.userId || 1;
      } catch (e) {
        console.warn('Could not parse userData from localStorage');
      }
    }
    return 1;
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

        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Force change detection by running inside NgZone
          this.ngZone.run(() => {
            console.log(`Setting preview URL for ${position}`);
            this.photoPreviewUrls.update(urls => ({
              ...urls,
              [position]: e.target.result
            }));
            console.log(`Preview URL updated for ${position}:`, this.photoPreviewUrls()[position]?.substring(0, 50));
          });
        };
        reader.readAsDataURL(file);
      }
    };

    fileInput.click();
  }

  hasPhoto(position: 'front' | 'back' | 'leftSide' | 'rightSide' | 'mileage'): boolean {
    return this.photos[position] !== null;
  }

  removePhoto(position: 'front' | 'back' | 'leftSide' | 'rightSide' | 'mileage') {
    this.photos[position] = null;
    // Update signal to trigger change detection
    this.photoPreviewUrls.update(urls => ({
      ...urls,
      [position]: null
    }));
    console.log(`Photo removed for ${position}`);
  }

  async onSubmit() {
    if (!this.reservationId) {
      alert('Reservation ID not found.');
      return;
    }

    // Set loading state
    this.isSubmitting.set(true);

    try {
      console.log('Submitting return for reservation ID:', this.reservationId);

      // Upload all photos to damage assessment endpoint
      const uploadPromises = [];
      const photoPositions: Array<'front' | 'back' | 'leftSide' | 'rightSide' | 'mileage'> =
        ['front', 'back', 'leftSide', 'rightSide', 'mileage'];

      for (const position of photoPositions) {
        if (this.photos[position]) {
          console.log(`Uploading ${position} photo...`);
          uploadPromises.push(this.uploadDamageAssessment(this.photos[position]!, position));
        }
      }

      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        console.log('All damage assessment photos uploaded successfully');
      }

      await this.vehicleService.completeReservation(Number(this.reservationId)).toPromise();
      console.log('Reservation completed successfully');
      this.showSuccessDialog.set(true);
      setTimeout(() => {
        this.router.navigate(['/my-rentals']);
      }, 2000);
    } catch (error) {
      console.error('Error completing reservation:', error);
      alert('Failed to complete reservation. Please try again.');
    } finally {
      // Always reset loading state
      this.isSubmitting.set(false);
    }
  }

  private async uploadDamageAssessment(file: File, position: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    // Get userId from localStorage
    const userId = this.getUserId().toString();

    // Get vehicleId from reservation data
    let vehicleId = '1'; // default
    if (this.reservationData && this.reservationData.vehicle) {
      vehicleId = this.reservationData.vehicle.id.toString();
    }

    formData.append('userId', userId);
    formData.append('vehicleId', vehicleId);

    console.log(`Uploading ${position} photo for userId: ${userId}, vehicleId: ${vehicleId}`);

    try {
      // First attempt with current token
      const token = this.authService.getToken();
      const response = await fetch('http://localhost:9000/api/damage-assessment/assess', {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        body: formData
      });

      if (response.status === 401) {
        console.log(`Got 401 for ${position} photo, attempting to refresh token...`);

        // Try to refresh token
        try {
          await this.authService.refreshAccessToken().toPromise();
          console.log('Token refreshed successfully, retrying upload...');

          // Retry with new token
          const newToken = this.authService.getToken();
          const retryResponse = await fetch('http://localhost:9000/api/damage-assessment/assess', {
            method: 'POST',
            headers: newToken ? {
              'Authorization': `Bearer ${newToken}`
            } : {},
            body: formData
          });

          if (!retryResponse.ok) {
            throw new Error(`Failed to upload ${position} photo after retry: ${retryResponse.statusText}`);
          }

          const result = await retryResponse.json();
          console.log(`${position} photo damage assessment result (after retry):`, result);
          return;
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          // If refresh fails, logout and redirect
          this.authService.logout();
          this.router.navigate(['/welcome']);
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        throw new Error(`Failed to upload ${position} photo: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`${position} photo damage assessment result:`, result);
    } catch (error) {
      console.error(`Error uploading ${position} photo:`, error);
      throw error;
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
