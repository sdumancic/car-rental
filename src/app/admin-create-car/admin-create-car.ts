import { Component, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';

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

  // VIN validation error
  vinError = signal(false);

  // Dropdown options
  typeOptions = ['Sedan', 'SUV', 'Truck', 'Van'];
  statusOptions = ['Available', 'Rented', 'Maintenance', 'Unavailable'];
  fuelTypeOptions = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];
  transmissionOptions = ['Automatic', 'Manual'];

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private location: Location
  ) {}

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

  addVehicle() {
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

    // Show success modal
    this.showSuccessModal.set(true);

    console.log('Adding new vehicle:', vehicle);

    // TODO: Implement API call to save vehicle
  }

  closeSuccessModal() {
    this.showSuccessModal.set(false);
    // Navigate back to vehicle list
    this.goBack();
  }
}

