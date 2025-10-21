import { Component, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { MetadataService } from '../services/metadata.service';
import { AppStore } from '../services/app.store';
import { VehicleService } from '../services/vehicle.service';

interface NewVehicle {
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  vin: string;
  type: string;
  status: string;
  passengers: number;
  doors: number;
  fuelType: string;
  transmission: string;
}

@Component({
  selector: 'app-admin-create-car',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-create-car.html',
  styleUrls: ['./admin-create-car.scss']
})
export class AdminCreateCarComponent {
  // New vehicle data
  newVehicle = signal<NewVehicle>({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    vin: '',
    type: 'Sedan',
    status: 'Available',
    passengers: 4,
    doors: 4,
    fuelType: 'Gasoline',
    transmission: 'Automatic'
  });

  // Show success modal
  showSuccessModal = signal(false);

  // Show success dialog
  showSuccessDialog = signal(false);

  // VIN validation error
  vinError = signal(false);

  // Dropdown options
  get fuelTypeOptions() { return this.appStore.fuelTypes; }
  get transmissionOptions() { return this.appStore.transmissionTypes; }

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private location: Location,
    private metadataService: MetadataService,
    public appStore: AppStore,
    private vehicleService: VehicleService
  ) {}

  async ngOnInit() {
    await this.metadataService.fetchMakes();
    await this.metadataService.fetchVehicleTypes();
    await this.metadataService.fetchTransmissionTypes();
    await this.metadataService.fetchFuelTypes();
    await this.metadataService.fetchVehicleStatuses();
  }

  get makes() { return this.appStore.makes; }
  get models() { return this.appStore.models; }
  get vehicleTypes() { return this.appStore.vehicleTypes; }
  get vehicleStatuses() { return this.appStore.vehicleStatuses; }

  async onMakeChange(make: string) {
    this.newVehicle.update(vehicle => ({ ...vehicle, make, model: '' }));
    await this.metadataService.fetchModels(make);
  }

  goBack() {
    this.location.back();
  }

  incrementPassengers() {
    const vehicle = this.newVehicle();
    if (vehicle.passengers < 20) {
      vehicle.passengers++;
      this.newVehicle.set({ ...vehicle });
    }
  }

  decrementPassengers() {
    const vehicle = this.newVehicle();
    if (vehicle.passengers > 1) {
      vehicle.passengers--;
      this.newVehicle.set({ ...vehicle });
    }
  }

  incrementDoors() {
    const vehicle = this.newVehicle();
    if (vehicle.doors < 5) {
      vehicle.doors++;
      this.newVehicle.set({ ...vehicle });
    }
  }

  decrementDoors() {
    const vehicle = this.newVehicle();
    if (vehicle.doors > 2) {
      vehicle.doors--;
      this.newVehicle.set({ ...vehicle });
    }
  }

  validateVIN(): boolean {
    const vin = this.newVehicle().vin;
    // Basic VIN validation (17 characters, alphanumeric)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    const isValid = vinRegex.test(vin);
    this.vinError.set(!isValid && vin.length > 0);
    return isValid;
  }

  onVinChange() {
    this.validateVIN();
  }

  async addVehicle() {
    // Validate form
    const vehicle = this.newVehicle();

    if (!vehicle.make || !vehicle.model || !vehicle.year || !vehicle.licensePlate || !vehicle.vin) {
      alert('Please fill in all required fields');
      return;
    }

    if (!this.validateVIN()) {
      alert('Please enter a valid VIN (17 characters)');
      return;
    }

    // Prepare payload for API
    const payload = {
      make: vehicle.make,
      model: vehicle.model,
      year: Number(vehicle.year),
      vin: vehicle.vin,
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.type,
      status: vehicle.status,
      passengers: vehicle.passengers,
      doors: vehicle.doors,
      fuelType: vehicle.fuelType.toUpperCase(),
      transmission: vehicle.transmission.toUpperCase()
    };

    try {
      await this.vehicleService.createVehicle(payload).toPromise();
      this.showSuccessDialog.set(true);
      setTimeout(() => {
        this.router.navigate(['/admin-car-overview']);
      }, 2000);
    } catch (error) {
      alert('Failed to add vehicle. Please try again.');
    }
  }

  closeSuccessModal() {
    this.showSuccessModal.set(false);
    // Navigate back to vehicle list
    this.goBack();
  }
}
