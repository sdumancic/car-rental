import { Component, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';

interface VehicleDetails {
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  type: string;
  status: string;
  passengers: number;
  doors: number;
  fuelType: string;
  transmission: string;
  images: string[];
}

interface EquipmentItem {
  name: string;
  enabled: boolean;
}

interface MediaItem {
  id: number;
  url: string;
  type: 'COVER_IMAGE' | 'FRONT_IMAGE' | 'BACK_IMAGE' | 'SIDE_IMAGE' | 'INTERIOR_IMAGE' | 'EXTERIOR_VIDEO' | 'INTERIOR_VIDEO';
  isVideo: boolean;
  isCover: boolean;
}

@Component({
  selector: 'app-admin-car-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-car-details.html',
  styleUrls: ['./admin-car-details.scss']
})
export class AdminCarDetailsComponent {
  // Active tab
  activeTab = signal<'details' | 'equipment' | 'media'>('details');

  // Current image index for carousel
  currentImageIndex = signal(0);

  // Vehicle details
  vehicleDetails = signal<VehicleDetails>({
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    vin: '1GKSK3BD3CR11',
    licensePlate: '7GTR123',
    type: 'Sedan',
    status: 'Available',
    passengers: 5,
    doors: 4,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop'
    ]
  });

  // Equipment items
  equipment = signal<EquipmentItem[]>([
    { name: 'GPS Navigation', enabled: true },
    { name: 'Bluetooth', enabled: true },
    { name: 'Sunroof', enabled: false },
    { name: 'Heated Seats', enabled: false },
    { name: 'Backup Camera', enabled: true },
    { name: 'Blind Spot Monitor', enabled: false },
    { name: 'Keyless Entry', enabled: true },
    { name: 'Power Windows', enabled: true },
    { name: 'Power Locks', enabled: true },
    { name: 'Cruise Control', enabled: true },
    { name: 'Air Conditioning', enabled: true },
    { name: 'ABS Brakes', enabled: true },
    { name: 'Traction Control', enabled: true }
  ]);

  // Media items
  mediaItems = signal<MediaItem[]>([
    { id: 1, url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop', type: 'COVER_IMAGE', isVideo: false, isCover: true },
    { id: 2, url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop', type: 'FRONT_IMAGE', isVideo: false, isCover: false },
    { id: 3, url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop', type: 'BACK_IMAGE', isVideo: false, isCover: false },
    { id: 4, url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop', type: 'SIDE_IMAGE', isVideo: false, isCover: false },
    { id: 5, url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop', type: 'INTERIOR_IMAGE', isVideo: false, isCover: false },
    { id: 6, url: 'https://www.youtube.com/embed/tgbNymZ7vqY', type: 'EXTERIOR_VIDEO', isVideo: true, isCover: false },
    { id: 7, url: 'https://www.youtube.com/embed/tgbNymZ7vqY', type: 'INTERIOR_VIDEO', isVideo: true, isCover: false }
  ]);

  // Dropdown options
  makeOptions = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Jeep'];
  modelOptions = ['Camry', 'Accord', 'Mustang', 'Silverado', 'Wrangler'];
  typeOptions = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback'];
  statusOptions = ['Available', 'Rented', 'Maintenance'];
  fuelTypeOptions = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];
  transmissionOptions = ['Automatic', 'Manual'];

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

  setActiveTab(tab: 'details' | 'equipment' | 'media') {
    this.activeTab.set(tab);
  }

  selectImage(index: number) {
    this.currentImageIndex.set(index);
  }

  onSave() {
    console.log('Saving vehicle details:', this.vehicleDetails());
    // Implement save logic
    alert('Vehicle details saved successfully!');
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  isDarkMode() {
    return this.isDarkModeActive();
  }

  toggleEquipment(index: number) {
    const items = this.equipment();
    items[index].enabled = !items[index].enabled;
    this.equipment.set([...items]);
  }

  deleteMediaItem(id: number) {
    const items = this.mediaItems().filter(item => item.id !== id);
    this.mediaItems.set(items);
  }

  setCoverImage(id: number) {
    const items = this.mediaItems().map(item => {
      item.isCover = item.id === id;
      return item;
    });
    this.mediaItems.set(items);
  }
}
