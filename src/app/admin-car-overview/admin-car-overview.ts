import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { AppStore } from '../services/app.store';
import { MetadataService } from '../services/metadata.service';
import { VehicleService } from '../services/vehicle.service';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  status: 'Available' | 'Rented';
  imageUrl: string;
}

@Component({
  selector: 'app-admin-car-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-car-overview.html',
  styleUrls: ['./admin-car-overview.scss']
})
export class AdminCarOverviewComponent implements OnInit {
  // Search query
  searchQuery = signal('');

  // Dropdown selections
  selectedMake = signal<string>('');
  selectedModel = signal<string>('');
  selectedVehicleType = signal<string>('');
  selectedTransmission = signal<string>('');
  selectedFuelType = signal<string>('');
  selectedStatus = signal<string>('');
  selectedYear = signal<number | null>(null);
  selectedPassengers = signal<number | null>(null);
  selectedDoors = signal<number | null>(null);

  // Sorting and pagination
  sort = signal<string>('+make,-model');
  page = signal<number>(0);
  size = signal<number>(10);

  // Vehicles list
  vehicles = signal<Vehicle[]>([]);

  // Filtered vehicles based on search
  filteredVehicles = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.vehicles();

    return this.vehicles().filter(vehicle =>
      vehicle.make.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.year.toString().includes(query)
    );
  });

  // Metadata signals from store
  get makes() { return this.appStore.makes; }
  get models() { return this.appStore.models; }
  get vehicleTypes() { return this.appStore.vehicleTypes; }
  get transmissionTypes() { return this.appStore.transmissionTypes; }
  get fuelTypes() { return this.appStore.fuelTypes; }
  get vehicleStatuses() { return this.appStore.vehicleStatuses; }

  // Dark mode
  isDarkModeActive = computed(() => this.themeService.darkMode());

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private location: Location,
    public appStore: AppStore,
    private metadataService: MetadataService,
    private vehicleService: VehicleService
  ) {}

  async ngOnInit() {
    await this.metadataService.fetchMakes();
    await this.metadataService.fetchVehicleTypes();
    await this.metadataService.fetchTransmissionTypes();
    await this.metadataService.fetchFuelTypes();
    await this.metadataService.fetchVehicleStatuses();
    await this.performVehicleSearch();
  }

  async performVehicleSearch() {
    const params: any = {
      make: this.selectedMake() || undefined,
      model: this.selectedModel() || undefined,
      year: this.selectedYear() || undefined,
      vehicleType: this.selectedVehicleType() || undefined,
      passengers: this.selectedPassengers() || undefined,
      doors: this.selectedDoors() || undefined,
      fuelType: this.selectedFuelType() || undefined,
      transmission: this.selectedTransmission() || undefined,
      sort: this.sort(),
      page: this.page(),
      size: this.size()
    };
    try {
      const response = await this.vehicleService.searchVehicles(params).toPromise();
      const vehicles = (response.data || []).map((v: any) => ({
        id: v.id,
        make: v.make,
        model: v.model,
        year: v.year,
        status: v.status,
        imageUrl: v.imageUrl || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
        vin: v.vin,
        licensePlate: v.licensePlate,
        vehicleType: v.vehicleType,
        passengers: v.passengers,
        doors: v.doors,
        fuelType: v.fuelType,
        transmission: v.transmission,
        active: v.active
      }));
      this.vehicles.set(vehicles);
    } catch (error) {
      console.error('Vehicle search failed', error);
      this.vehicles.set([]);
    }
  }

  async onMakeChange(make: string) {
    this.selectedMake.set(make);
    this.selectedModel.set('');
    if (make) {
      await this.metadataService.fetchModels(make);
    } else {
      this.appStore.setModels([]);
    }
    await this.performVehicleSearch();
  }

  async onModelChange(model: string) {
    this.selectedModel.set(model);
    await this.performVehicleSearch();
  }

  async onYearChange(year: number) {
    this.selectedYear.set(year);
    await this.performVehicleSearch();
  }

  async onVehicleTypeChange(type: string) {
    this.selectedVehicleType.set(type);
    await this.performVehicleSearch();
  }

  async onPassengersChange(passengers: number) {
    this.selectedPassengers.set(passengers);
    await this.performVehicleSearch();
  }

  async onDoorsChange(doors: number) {
    this.selectedDoors.set(doors);
    await this.performVehicleSearch();
  }

  async onFuelTypeChange(fuel: string) {
    this.selectedFuelType.set(fuel);
    await this.performVehicleSearch();
  }

  async onTransmissionChange(trans: string) {
    this.selectedTransmission.set(trans);
    await this.performVehicleSearch();
  }

  async onStatusChange(status: string) {
    this.selectedStatus.set(status);
    await this.performVehicleSearch();
  }

  goBack() {
    this.location.back();
  }

  onAddVehicle() {
    // Navigate to create car page
    this.router.navigate(['/admin-create-car']);
  }

  onEditVehicle(vehicle: Vehicle) {
    // Navigate to car details page
    this.router.navigate(['/admin-car-details']);
  }

  onDeleteVehicle(vehicle: Vehicle) {
    const confirmed = confirm(`Are you sure you want to delete ${vehicle.make} ${vehicle.model}?`);
    if (confirmed) {
      this.vehicles.update(vehicles =>
        vehicles.filter(v => v.id !== vehicle.id)
      );
      console.log('Vehicle deleted:', vehicle);
    }
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  isDarkMode() {
    return this.isDarkModeActive();
  }
}
