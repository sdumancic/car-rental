import { Component, signal, computed, Inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { MetadataService } from '../services/metadata.service';
import { AppStore } from '../services/app.store';
import { VehicleService } from '../services/vehicle.service';

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
  vehicleDetails = signal<VehicleDetails | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

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

  // Dropdown options from metadata
  makeOptions: string[] = [];
  modelOptions: string[] = [];
  typeOptions: string[] = [];
  statusOptions: string[] = [];
  fuelTypeOptions: string[] = [];
  transmissionOptions: string[] = [];

  // Dark mode
  isDarkModeActive = computed(() => this.themeService.darkMode());

  constructor(
    private router: Router,
    private location: Location,
    private themeService: ThemeService,
    private activatedRoute: ActivatedRoute,
    private metadataService: MetadataService,
    private appStore: AppStore,
    private vehicleService: VehicleService // dodano
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { vehicleDetails?: any };
    if (state?.vehicleDetails) {
      // Merge with defaults to ensure all fields exist
      const defaults: VehicleDetails = {
        make: '',
        model: '',
        year: 0,
        vin: '',
        licensePlate: '',
        type: '',
        status: '',
        passengers: 0,
        doors: 0,
        fuelType: '',
        transmission: '',
        images: []
      };
      // Map vehicleType to type if present
      const incoming = { ...state.vehicleDetails };
      if (incoming.vehicleType && !incoming.type) {
        incoming.type = incoming.vehicleType;
      }
      // Map vehicleModel to model if present
      if (incoming.vehicleModel && !incoming.model) {
        incoming.model = incoming.vehicleModel;
      }
      this.vehicleDetails.set({ ...defaults, ...incoming, images: incoming.images ?? [] });
    }
  }

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isLoading.set(true);
        this.error.set(null);
        this.vehicleService.getVehicleById(Number(id)).subscribe({
          next: async details => {
            if (details) {
              // Map vehicleType to type if present
              if (details.vehicleType && !details.type) {
                details.type = details.vehicleType;
              }
              // Map vehicleModel to model if present
              if (details.vehicleModel && !details.model) {
                details.model = details.vehicleModel;
              }
              await this.metadataService.fetchModels(details.make);
              this.modelOptions = this.appStore.models();
              // If details.model is not in modelOptions, set to first available
              if (!this.modelOptions.includes(details.model)) {
                details.model = this.modelOptions[0] || '';
              }
              this.vehicleDetails.set(details);
            } else {
              this.error.set('Vehicle not found.');
              this.vehicleDetails.set(null);
            }
            this.isLoading.set(false);
          },
          error: () => {
            this.error.set('Failed to fetch vehicle details.');
            this.vehicleDetails.set(null);
            this.isLoading.set(false);
          }
        });
      }
    });
    await this.metadataService.fetchAllMetadata();
    this.makeOptions = this.appStore.makes();
    this.typeOptions = this.appStore.vehicleTypes();
    this.statusOptions = this.appStore.vehicleStatuses();
    this.fuelTypeOptions = this.appStore.fuelTypes();
    this.transmissionOptions = this.appStore.transmissionTypes();
  }

  async onMakeChange() {
    const details = this.vehicleDetails();
    await this.metadataService.fetchModels(details?.make ?? '');
    this.modelOptions = this.appStore.models();
    // Reset model if not in options
    if (!this.modelOptions.includes(details?.model ?? '')) {
      this.vehicleDetails.set({
        make: details?.make ?? '',
        model: this.modelOptions[0] || '',
        year: details?.year ?? 0,
        vin: details?.vin ?? '',
        licensePlate: details?.licensePlate ?? '',
        type: details?.type ?? '',
        status: details?.status ?? '',
        passengers: details?.passengers ?? 0,
        doors: details?.doors ?? 0,
        fuelType: details?.fuelType ?? '',
        transmission: details?.transmission ?? '',
        images: details?.images ?? []
      });
    }
  }

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
