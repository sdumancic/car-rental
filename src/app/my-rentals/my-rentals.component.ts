import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStore } from '../services/app.store';
import { FooterNavComponent } from '../footer-nav/footer-nav.component';
import { VehicleService } from '../services/vehicle.service';

@Component({
  selector: 'app-my-rentals',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterNavComponent],
  templateUrl: './my-rentals.component.html',
  styleUrls: ['./my-rentals.component.scss']
})
export class MyRentalsComponent {
  // Inject the store
  activeRental: any;
  isDarkMode: any;

  // User reservations
  reservations = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  constructor(
    private store: AppStore,
    private router: Router,
    private vehicleService: VehicleService
  ) {
    this.activeRental = this.store.activeRental;
    this.isDarkMode = this.store.isDarkMode;

    // Učitavam rezervacije korisnika
    this.loadUserReservations();
  }

  async loadUserReservations() {
    try {
      this.isLoading.set(true);

      // TODO: Zamijeniti sa pravim user ID-em iz authentication
      const userId = 1;

      const response = await this.vehicleService.getUserReservations({
        userId: userId,
        status: 'CONFIRMED',
        page: 0,
        size: 10
      }).toPromise();

      console.log('User reservations response:', response);

      if (response && response.data) {
        // Dohvaćam slike za svako vozilo
        const reservationsWithImages = [];

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

          reservationsWithImages.push({
            ...reservation,
            imageUrl: imageUrl
          });
        }

        this.reservations.set(reservationsWithImages);
        console.log('Loaded reservations with images:', reservationsWithImages);
      }

      this.isLoading.set(false);
    } catch (error) {
      console.error('Error loading user reservations:', error);
      this.isLoading.set(false);
    }
  }

  onViewDetails(reservationId: number) {
    console.log('Viewing rental details for reservation:', reservationId);
    // Navigate to rental details page with reservation ID
    this.router.navigate(['/reservation-details', reservationId]);
  }

  onReturnCar(reservationId: number) {
    console.log('Returning car for reservation:', reservationId);
    // Navigate to return car page with reservation ID
    this.router.navigate(['/return-car', reservationId]);
  }

  onViewHistory() {
    console.log('Viewing rental history...');
    // Navigate to rental history page
    this.router.navigate(['/rental-history']);
  }

  onMenuClick() {
    console.log('Menu clicked');
    // Show menu options
  }

  navigateToSearch() {
    this.router.navigate(['/search']);
  }

  navigateToRentals() {
    this.router.navigate(['/rentals']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  toggleDarkMode() {
    this.store.toggleDarkMode();
  }
}
