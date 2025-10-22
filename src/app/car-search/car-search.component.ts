import { Component, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStore, Car, SearchCriteria } from '../services/app.store';
import { FooterNavComponent } from '../footer-nav/footer-nav.component';
import { MetadataService } from '../services/metadata.service';
import { VehicleService } from '../services/vehicle.service';

@Component({
  selector: 'app-car-search',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterNavComponent],
  templateUrl: './car-search.component.html',
  styleUrls: ['./car-search.component.scss']
})
export class CarSearchComponent {
  // Inject the store
  activeTab: Signal<string>;
  activeFilter: Signal<string | null>;
  cars: Signal<Car[]>;
  searchCriteria: Signal<SearchCriteria>;
  isDarkMode: Signal<boolean>;

  vehicleTypes: Signal<string[]>;

  selectedCarType: string = '';

  startDate: string = '';
  endDate: string = '';

  // Loading state
  isLoading = signal<boolean>(false);

  constructor(
    private store: AppStore,
    private router: Router,
    private metadataService: MetadataService,
    private vehicleService: VehicleService
  ) {
    this.activeTab = this.store.activeTab;
    this.activeFilter = this.store.activeFilter;
    this.cars = this.store.cars;
    this.searchCriteria = this.store.searchCriteria;
    this.isDarkMode = this.store.isDarkMode;
    this.vehicleTypes = this.store.vehicleTypes;
    // Prefill reservation dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const oneWeekLater = new Date();
    oneWeekLater.setDate(tomorrow.getDate() + 6);
    this.startDate = tomorrow.toISOString().slice(0, 10);
    this.endDate = oneWeekLater.toISOString().slice(0, 10);
    // Load vehicle types
    this.loadMetadata();
    // Perform initial search
    this.onSearch();
  }

  async loadMetadata() {
    await this.metadataService.fetchVehicleTypes();
  }

  getActiveTab() {
    return this.activeTab();
  }

  getActiveFilter() {
    return this.activeFilter();
  }

  getCars() {
    return this.cars();
  }

  setActiveTab(tab: string) {
    this.store.setActiveTab(tab);
  }

  toggleFilter(filter: string) {
    if (this.activeFilter() === filter) {
      this.store.setActiveFilter(null);
    } else {
      this.store.setActiveFilter(filter);
    }
  }

  onSearch() {
    // Format dates to ISO 8601 format for the API
    const reservationStart = this.startDate ? new Date(this.startDate + 'T00:00:00').toISOString() : undefined;
    const reservationEnd = this.endDate ? new Date(this.endDate + 'T00:00:00').toISOString() : undefined;

    const searchParams = {
      vehicleType: this.selectedCarType || undefined,
      reservationStart,
      reservationEnd,
      page: 0,
      size: 10,
      sort: '+make,-model'
    };

    console.log('Searching with params:', searchParams);

    // Set loading state to true
    this.isLoading.set(true);
    // Clear previous results
    this.store.updateCars([]);

    this.vehicleService.searchVehicles(searchParams).subscribe({
      next: async (response) => {
        console.log('Search results:', response);
        // Map the API response to Car objects and update the store
        if (response && response.data) {
          const carsWithPricing: Car[] = [];

          for (const item of response.data) {
            const vehicle = item.vehicle;
            let price = 50; // Default price
            let imageUrl = 'https://placehold.co/400x300?text=Car'; // Default image

            // Fetch pricing for each vehicle
            try {
              const pricingResponse = await this.vehicleService.getVehiclePricing(vehicle.id).toPromise();
              console.log(`Pricing for vehicle ${vehicle.id}:`, pricingResponse);

              // Get price from first pricing tier
              if (pricingResponse &&
                  pricingResponse.pricingCategory &&
                  pricingResponse.pricingCategory.pricingTiers &&
                  pricingResponse.pricingCategory.pricingTiers.length > 0) {
                price = pricingResponse.pricingCategory.pricingTiers[0].price;
              }
            } catch (error) {
              console.error(`Error fetching pricing for vehicle ${vehicle.id}:`, error);
            }

            // Fetch vehicle media and get COVER_IMAGE
            try {
              const media = await this.vehicleService.getVehicleMedia(vehicle.id).toPromise();
              if (media && media.length > 0) {
                const coverImage = media.find((m: any) => m.vehicleMediaType === 'COVER_IMAGE');
                if (coverImage) {
                  const blob = await this.vehicleService.downloadVehicleMedia(vehicle.id, coverImage.id).toPromise();
                  if (blob) {
                    imageUrl = window.URL.createObjectURL(blob);
                  }
                }
              }
            } catch (error) {
              console.error(`Error fetching media for vehicle ${vehicle.id}:`, error);
            }

            carsWithPricing.push({
              id: vehicle.id,
              type: vehicle.vehicleType || 'Unknown',
              model: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
              price: price,
              seats: vehicle.passengers || 0,
              bags: vehicle.doors || 0,
              imageUrl: imageUrl,
              available: item.available
            });
          }

          this.store.updateCars(carsWithPricing);
          console.log('Updated cars in store with pricing:', carsWithPricing);
        }
        // Set loading state to false after data is loaded
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error searching vehicles:', error);
        // Set loading state to false on error
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    window.history.back();
  }

  toggleDarkMode() {
    this.store.toggleDarkMode();
  }

  // Getters and setters for two-way binding with ngModel
  get location(): string {
    return this.searchCriteria().location;
  }

  set location(value: string) {
    this.store.updateSearchCriteria({ location: value });
  }

  get startDateValue(): string {
    return this.searchCriteria().startDate;
  }

  set startDateValue(value: string) {
    this.store.updateSearchCriteria({ startDate: value });
  }

  get endDateValue(): string {
    return this.searchCriteria().endDate;
  }

  set endDateValue(value: string) {
    this.store.updateSearchCriteria({ endDate: value });
  }

  selectCar(car: Car) {
    console.log('Selected car:', car);
    // Spremam odabrano vozilo u store
    this.store.setSelectedCar(car);
    // Spremam datume rezervacije u store
    this.store.updateSearchCriteria({
      startDate: this.startDate,
      endDate: this.endDate
    });
    // Navigiram na stranicu rezervacije
    this.router.navigate(['/reservation-details']);
  }
}
