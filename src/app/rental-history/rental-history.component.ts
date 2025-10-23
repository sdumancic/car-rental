import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { FooterNavComponent } from '../footer-nav/footer-nav.component';
import { VehicleService } from '../services/vehicle.service';
import { AuthService } from '../services/auth.service';

interface PastRental {
  id: number;
  carName: string;
  carType: string;
  imageUrl: string;
  dateRange: string;
  location: string;
  totalCost: number;
  status?: string;
}

@Component({
  selector: 'app-rental-history',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterNavComponent],
  templateUrl: './rental-history.component.html',
  styleUrls: ['./rental-history.component.scss']
})
export class RentalHistoryComponent {
  // Past rentals data
  pastRentals = signal<PastRental[]>([]);
  isLoading = signal<boolean>(true);

  // Create a computed signal for dark mode state
  isDarkModeActive = computed(() => this.themeService.darkMode());

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private vehicleService: VehicleService,
    private authService: AuthService
  ) {
    this.loadRentalHistory();
  }

  async loadRentalHistory() {
    try {
      this.isLoading.set(true);

      const userId = this.authService.getUserId();
      if (!userId) {
        console.error('User not authenticated');
        this.isLoading.set(false);
        this.router.navigate(['/welcome']);
        return;
      }

      const response = await this.vehicleService.getRentalHistory({
        userId: userId,
        page: 0,
        size: 10,
        sort: '-startDate'
      }).toPromise();

      console.log('Rental history response:', response);

      if (response && response.data) {
        // Dohvaćam slike za svako vozilo i transformišem podatke
        const rentalsWithImages = [];

        for (const reservation of response.data) {
          let imageUrl = 'https://placehold.co/400x300?text=Car';

          if (reservation.vehicle && reservation.vehicle.id) {
            try {
              // Dohvaćam media za vozilo
              const media = await this.vehicleService.getVehicleMedia(reservation.vehicle.id).toPromise();

              if (media && media.length > 0) {
                // Prvo tražim COVER_IMAGE
                const coverImage = media.find((m: any) => m.vehicleMediaType === 'COVER_IMAGE');
                const imageToLoad = coverImage || media[0];

                // Dohvaćam blob
                const blob = await this.vehicleService.downloadVehicleMedia(
                  reservation.vehicle.id,
                  imageToLoad.id
                ).toPromise();

                if (blob) {
                  imageUrl = window.URL.createObjectURL(blob);
                }
              }
            } catch (error) {
              console.error(`Error loading image for vehicle ${reservation.vehicle.id}:`, error);
            }
          }

          // Format date range
          const startDate = new Date(reservation.startDate);
          const endDate = new Date(reservation.endDate);
          const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

          rentalsWithImages.push({
            id: reservation.id,
            carName: `${reservation.vehicle.make} ${reservation.vehicle.model}`,
            carType: reservation.vehicle.vehicleType || 'or similar',
            imageUrl: imageUrl,
            dateRange: dateRange,
            location: 'Airport', // TODO: Add location field if available in backend
            totalCost: reservation.price || 0,
            status: reservation.status
          });
        }

        this.pastRentals.set(rentalsWithImages);
        console.log('Loaded rental history with images:', rentalsWithImages);
      }

      this.isLoading.set(false);
    } catch (error) {
      console.error('Error loading rental history:', error);
      this.isLoading.set(false);
      // Set empty array on error
      this.pastRentals.set([]);
    }
  }

  goBack() {
    this.router.navigate(['/my-rentals']);
  }

  onSort() {
    console.log('Sort clicked');
    // Implement sort logic here
  }

  onFilter() {
    console.log('Filter clicked');
    // Implement filter logic here
  }

  onRentalClick(rental: PastRental) {
    console.log('Rental clicked:', rental);
    // Navigate to rental details
    // this.router.navigate(['/rental-details', rental.id]);
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

