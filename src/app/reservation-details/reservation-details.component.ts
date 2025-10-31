import { Component, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { AppStore } from '../services/app.store';
import { VehicleService } from '../services/vehicle.service';
import { AuthService } from '../services/auth.service';

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

  // Vehicle ID for pricing calculations
  vehicleId: number | null = null;

  // Current image index for carousel
  currentImageIndex = signal(0);

  // Reservation details using signals
  startDate = signal('');
  endDate = signal('');

  // Getter properties for formatted date display (DD.MM.YYYY)
  get startDateDisplay(): string {
    return this.formatDateForDisplay(this.startDate());
  }

  get endDateDisplay(): string {
    return this.formatDateForDisplay(this.endDate());
  }

  // Calculated pricing from API
  calculatedPrice = signal<number | null>(null);

  // Error handling
  errorMessage = signal<string | null>(null);

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

    // Postavljam vrijeme na ponoć da izbjegnem probleme s vremenskim zonama
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Dodajem +1 jer trebam uključiti i početni dan
    // npr. 23.09 - 30.09 = 7 dana razlika, ali trebam 8 dana (uključujući oba datuma)
    const totalDays = diffDays + 1;

    console.log(`Rental days calculation: start=${this.startDate()}, end=${this.endDate()}, days=${totalDays}`);

    return totalDays > 0 ? totalDays : 0;
  });

  // Cost breakdown - only calculate if dates are selected
  costBreakdown = computed(() => {
    if (!this.areDatesSelected()) {
      return { days: 0, subtotal: 0, taxesAndFees: 0, total: 0 };
    }

    const days = this.rentalDays();
    const calculatedPriceValue = this.calculatedPrice();
    const fallbackPrice = days * this.carDetails.pricePerDay;
    const subtotal = calculatedPriceValue !== null ? calculatedPriceValue : fallbackPrice;
    const taxesAndFees = 25.00;
    const total = subtotal + taxesAndFees;

    console.log(`Cost breakdown: days=${days}, calculatedPrice=${calculatedPriceValue}, fallbackPrice=${fallbackPrice}, subtotal=${subtotal}`);

    return {
      days,
      subtotal,
      taxesAndFees,
      total
    };
  });

  // Create a computed signal for dark mode state
  isDarkModeActive = computed(() => this.themeService.darkMode());

  // Reservation ID if viewing existing reservation
  reservationId: string | null = null;

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private store: AppStore,
    private vehicleService: VehicleService,
    private authService: AuthService
  ) {
    // Check if we have a reservation ID from route
    this.reservationId = this.route.snapshot.paramMap.get('id');

    if (this.reservationId) {
      // Loading existing reservation
      console.log('Loading existing reservation:', this.reservationId);
      this.loadExistingReservation(Number(this.reservationId));
    } else {
      // Creating new reservation from selected car
      console.log('Creating new reservation from selected car');
      this.loadSelectedCarData();
    }
  }

  async loadExistingReservation(reservationId: number) {
    try {
      const userId = this.authService.getUserId();
      if (!userId) {
        this.errorMessage.set('User not authenticated');
        return;
      }

      // TODO: Add method to get single reservation by ID
      // For now, we can get all user reservations and filter
      const response = await this.vehicleService.getUserReservations({
        userId: userId,
        page: 0,
        size: 100
      }).toPromise();

      if (response && response.data) {
        const reservation = response.data.find((r: any) => r.id === reservationId);

        if (reservation) {
          this.vehicleId = reservation.vehicle.id;

          // Load vehicle images
          let imageUrl = 'https://placehold.co/800x600?text=Car';
          try {
            const media = await this.vehicleService.getVehicleMedia(reservation.vehicle.id).toPromise();
            if (media && media.length > 0) {
              const coverImage = media.find((m: any) => m.vehicleMediaType === 'COVER_IMAGE');
              const imageToLoad = coverImage || media[0];
              const blob = await this.vehicleService.downloadVehicleMedia(
                reservation.vehicle.id,
                imageToLoad.id
              ).toPromise();
              if (blob) {
                imageUrl = window.URL.createObjectURL(blob);
              }
            }
          } catch (error) {
            console.error('Error loading vehicle image:', error);
          }

          this.carDetails = {
            name: `${reservation.vehicle.make} ${reservation.vehicle.model}`,
            variant: reservation.vehicle.vehicleType || '',
            pricePerDay: reservation.price || 0,
            seats: reservation.vehicle.passengers || 5,
            doors: reservation.vehicle.doors || 4,
            transmission: reservation.vehicle.transmission || 'Automatic',
            images: [imageUrl]
          };

          // Set dates
          this.startDate.set(new Date(reservation.startDate).toISOString().split('T')[0]);
          this.endDate.set(new Date(reservation.endDate).toISOString().split('T')[0]);

          // Calculate pricing
          this.calculatePricing();
        }
      }
    } catch (error) {
      console.error('Error loading existing reservation:', error);
      this.errorMessage.set('Failed to load reservation details');
    }
  }

  async loadSelectedCarData() {
    const selectedCar = this.store.selectedCar();
    const searchCriteria = this.store.searchCriteria();

    if (selectedCar) {
      // Spremam vehicle ID za kasnije izračune cijene
      this.vehicleId = selectedCar.id || null;

      // Učitavam osnovne podatke o vozilu
      this.carDetails = {
        name: selectedCar.model || 'Unknown Vehicle',
        variant: selectedCar.type || '',
        pricePerDay: selectedCar.price || 0,
        seats: selectedCar.seats || 5,
        doors: selectedCar.bags || 4,
        transmission: 'Automatic',
        images: []
      };

      // Ako postoji slika vozila, dodajem je
      if (selectedCar.imageUrl) {
        this.carDetails.images = [selectedCar.imageUrl];
      }

      // Učitavam sve slike vozila ako postoji ID
      if (selectedCar.id) {
        try {
          const media = await this.vehicleService.getVehicleMedia(selectedCar.id).toPromise();
          if (media && media.length > 0) {
            const imageUrls: string[] = [];

            // Prvo dodajem COVER_IMAGE
            const coverImage = media.find((m: any) => m.vehicleMediaType === 'COVER_IMAGE');
            if (coverImage) {
              const blob = await this.vehicleService.downloadVehicleMedia(selectedCar.id, coverImage.id).toPromise();
              if (blob) {
                imageUrls.push(window.URL.createObjectURL(blob));
              }
            }

            // Zatim dodajem ostale slike
            for (const mediaItem of media) {
              if (mediaItem.vehicleMediaType !== 'COVER_IMAGE') {
                try {
                  const blob = await this.vehicleService.downloadVehicleMedia(selectedCar.id, mediaItem.id).toPromise();
                  if (blob) {
                    imageUrls.push(window.URL.createObjectURL(blob));
                  }
                } catch (error) {
                  console.error(`Error loading image ${mediaItem.id}:`, error);
                }
              }
            }

            if (imageUrls.length > 0) {
              this.carDetails.images = imageUrls;
            }
          }
        } catch (error) {
          console.error('Error loading vehicle media:', error);
        }
      }

      // Ako nema slika, postavljam placeholder
      if (this.carDetails.images.length === 0) {
        this.carDetails.images = ['https://placehold.co/800x600?text=Car'];
      }
    }

    // Učitavam datume rezervacije
    if (searchCriteria.startDate) {
      this.startDate.set(searchCriteria.startDate);
    }
    if (searchCriteria.endDate) {
      this.endDate.set(searchCriteria.endDate);
    }

    // Izračunavam cijenu za početne datume
    this.calculatePricing();
  }

  async calculatePricing() {
    // Provjeravam da li su oba datuma odabrana i da li postoji vehicleId
    if (!this.areDatesSelected() || !this.vehicleId) {
      return;
    }

    const days = this.rentalDays();
    if (days <= 0) {
      return;
    }

    try {
      console.log(`Calculating pricing for vehicle ${this.vehicleId} for ${days} days`);
      const pricingResponse = await this.vehicleService.calculateVehiclePricing(this.vehicleId, days).toPromise();
      console.log('Pricing response:', pricingResponse);

      // API vraća direktno broj (cijenu PO DANU), a ne objekt
      let pricePerDay: number;

      if (typeof pricingResponse === 'number') {
        // API vraća direktno broj
        pricePerDay = pricingResponse;
      } else if (pricingResponse && pricingResponse.totalPrice) {
        // API vraća objekt sa totalPrice
        pricePerDay = pricingResponse.totalPrice;
      } else {
        console.error('Unexpected pricing response format:', pricingResponse);
        return;
      }

      const totalPrice = pricePerDay * days;
      this.calculatedPrice.set(totalPrice);

      console.log(`Price per day: $${pricePerDay}, Total for ${days} days: $${totalPrice}`);
    } catch (error) {
      console.error('Error calculating pricing:', error);
      // Resetiram cijenu na null ako dođe do greške
      this.calculatedPrice.set(null);
    }
  }

  onDateChange() {
    // Pozivam calculatePricing kada se promijeni bilo koji datum
    this.calculatePricing();
  }

  goBack() {
    this.location.back();
  }

  async onReserve() {
    if (!this.areDatesSelected()) {
      alert('Please select both start and end dates');
      return;
    }

    if (!this.vehicleId) {
      alert('Vehicle information is missing');
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      alert('User not authenticated. Please log in again.');
      this.router.navigate(['/welcome']);
      return;
    }

    // Resetiram error poruku prije novog pokušaja
    this.errorMessage.set(null);

    try {
      // Formatiram datume u ISO 8601 format
      const startDateISO = new Date(this.startDate() + 'T00:00:00.000Z').toISOString();
      const endDateISO = new Date(this.endDate() + 'T00:00:00.000Z').toISOString();

      const reservationData = {
        userId: userId,
        vehicleId: this.vehicleId,
        startDate: startDateISO,
        endDate: endDateISO
      };

      console.log('Creating reservation:', reservationData);

      const response = await this.vehicleService.createReservation(reservationData).toPromise();

      console.log('Reservation created successfully:', response);

      // Spremam rezervaciju u store da bi payment stranica imala pristup podacima
      this.store.setCurrentReservation(response);

      // Navigate to payment page
      this.router.navigate(['/payment']);

    } catch (error: any) {
      console.error('Error creating reservation:', error);

      // Izvlačim error poruku iz responsa
      let errorMsg = 'Failed to create reservation. Please try again.';

      if (error && error.error) {
        if (error.error.message) {
          errorMsg = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMsg = error.error;
        }
      } else if (error && error.message) {
        errorMsg = error.message;
      }

      // Postavljam error poruku u signal
      this.errorMessage.set(errorMsg);

      console.log('Error message set to:', errorMsg);
    }
  }

  selectImage(index: number) {
    this.currentImageIndex.set(index);
  }

  previousImage() {
    const currentIndex = this.currentImageIndex();
    const newIndex = currentIndex === 0 ? this.carDetails.images.length - 1 : currentIndex - 1;
    this.currentImageIndex.set(newIndex);
  }

  nextImage() {
    const currentIndex = this.currentImageIndex();
    const newIndex = currentIndex === this.carDetails.images.length - 1 ? 0 : currentIndex + 1;
    this.currentImageIndex.set(newIndex);
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  isDarkMode() {
    return this.isDarkModeActive();
  }

  // Helper method to format date as DD.MM.YYYY
  formatDateForDisplay(isoDate: string): string {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
}
