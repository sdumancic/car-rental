import { Component, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  status: 'Available' | 'Rented';
  imageUrl: string;
}

@Component({
  selector: 'app-car-administration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './car-administration.html',
  styleUrls: ['./car-administration.scss']
})
export class CarAdministrationComponent {
  // Search query
  searchQuery = signal('');

  // Vehicles list
  vehicles = signal<Vehicle[]>([
    {
      id: 1,
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      status: 'Available',
      imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      make: 'Honda',
      model: 'CR-V',
      year: 2022,
      status: 'Rented',
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      make: 'Ford',
      model: 'Mustang',
      year: 2021,
      status: 'Available',
      imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      make: 'Chevrolet',
      model: 'Silverado',
      year: 2022,
      status: 'Rented',
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      make: 'Jeep',
      model: 'Wrangler',
      year: 2023,
      status: 'Available',
      imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop'
    }
  ]);

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

  // Dark mode
  isDarkModeActive = computed(() => this.themeService.darkMode());

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private location: Location
  ) {}

  goBack() {
    this.location.back();
  }

  onAddVehicle() {
    console.log('Add new vehicle clicked');
    // Implement add vehicle logic
  }

  onEditVehicle(vehicle: Vehicle) {
    console.log('Edit vehicle:', vehicle);
    // Implement edit vehicle logic
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

