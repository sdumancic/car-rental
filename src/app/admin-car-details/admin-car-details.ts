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

@Component({
  selector: 'app-admin-car-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-car-details.html',
  styleUrls: ['./admin-car-details.scss']
})
export class AdminCarDetailsComponent {
  // Active tab
  activeTab = signal<'details' | 'equipment' | 'media' | 'pricing'>('details');

  // Current image index for carousel
  currentImageIndex = signal(0);

  // Vehicle details
  vehicleDetails = signal<VehicleDetails | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Pricing data
  pricingCategories = signal<any[]>([]);
  activePricingCategory = signal<any>(null);
  isPricingLoading = signal<boolean>(false);

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

  // vehicleMediaList will be used for all media display and actions
  vehicleMediaList = signal<any[]>([]);

  // All possible media types
  readonly mediaTypes = [
    { type: 'COVER_IMAGE', label: 'Cover Image', isVideo: false },
    { type: 'FRONT_IMAGE', label: 'Front Image', isVideo: false },
    { type: 'BACK_IMAGE', label: 'Back Image', isVideo: false },
    { type: 'SIDE_IMAGE', label: 'Side Image', isVideo: false },
    { type: 'INTERIOR_IMAGE', label: 'Interior Image', isVideo: false },
    { type: 'EXTERIOR_VIDEO', label: 'Exterior Video', isVideo: true },
    { type: 'INTERIOR_VIDEO', label: 'Interior Video', isVideo: true }
  ];

  // Dropdown options from metadata
  makeOptions: string[] = [];
  modelOptions: string[] = [];
  typeOptions: string[] = [];
  statusOptions: string[] = [];
  fuelTypeOptions: string[] = [];
  transmissionOptions: string[] = [];

  // Dark mode
  isDarkModeActive = computed(() => this.themeService.darkMode());

  equipmentList = signal<any[]>([]);
  carEquipmentIds = signal<Set<number>>(new Set());

  constructor(
    private router: Router,
    private location: Location,
    private themeService: ThemeService,
    private activatedRoute: ActivatedRoute,
    private metadataService: MetadataService,
    private appStore: AppStore,
    private vehicleService: VehicleService,
    private route: ActivatedRoute
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
    this.loadEquipmentData();
  }

  async loadEquipmentData() {
    const vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    // Fetch all equipment
    const allEquipment = await this.metadataService.fetchEquipments();
    this.equipmentList.set(allEquipment || []);
    // Fetch car's equipment
    this.vehicleService.getVehicleEquipment(vehicleId).subscribe(equipments => {
      // Assume returned array of equipment objects with id property
      this.carEquipmentIds.set(new Set(equipments.map(e => e.id)));
    });
  }

  isEquipmentEnabled(equipmentId: number): boolean {
    return this.carEquipmentIds().has(equipmentId);
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
              // Fetch images for carousel
              await this.loadVehicleImages();
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

  async loadVehicleMedia() {
    const vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    this.vehicleService.getVehicleMedia(vehicleId).subscribe(async media => {
      const existingMediaTypes = new Set<string>();
      const mediaList: any[] = [];

      // Download existing media items
      if (media && media.length > 0) {
        const mediaPromises = media.map(async (item: any) => {
          try {
            existingMediaTypes.add(item.vehicleMediaType);
            const blob = await this.vehicleService.downloadVehicleMedia(vehicleId, item.id).toPromise();
            const url = window.URL.createObjectURL(blob!);

            return {
              id: item.id,
              type: item.vehicleMediaType,
              fileName: item.fileName,
              fileType: item.fileType,
              url: url,
              isVideo: item.vehicleMediaType === 'EXTERIOR_VIDEO' || item.vehicleMediaType === 'INTERIOR_VIDEO',
              isCover: item.vehicleMediaType === 'COVER_IMAGE',
              isPlaceholder: false
            };
          } catch (error) {
            console.error(`Failed to download media ${item.id}:`, error);
            return null;
          }
        });

        const downloadedMedia = await Promise.all(mediaPromises);
        mediaList.push(...downloadedMedia.filter(item => item !== null));
      }

      // Add placeholders for missing media types
      this.mediaTypes.forEach(mediaType => {
        if (!existingMediaTypes.has(mediaType.type)) {
          mediaList.push({
            id: null,
            type: mediaType.type,
            label: mediaType.label,
            isVideo: mediaType.isVideo,
            isPlaceholder: true,
            isCover: false
          });
        }
      });

      this.vehicleMediaList.set(mediaList);
    });
  }

  async downloadMedia(media: any) {
    const vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    this.vehicleService.downloadVehicleMedia(vehicleId, media.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = media.fileName || 'media';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  goBack() {
    this.location.back();
  }

  setActiveTab(tab: 'details' | 'equipment' | 'media' | 'pricing') {
    this.activeTab.set(tab);
    if (tab === 'media') {
      this.loadVehicleMedia();
    }
    if (tab === 'details') {
      this.loadVehicleImages();
    }
    if (tab === 'pricing') {
      this.loadPricingData();
    }
  }

  selectImage(index: number) {
    this.currentImageIndex.set(index);
  }

  onSave() {
    const details = this.vehicleDetails();
    if (!details) return;
    const vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    // Prepare payload for API
    const payload = {
      make: details.make,
      model: details.model,
      year: details.year,
      vin: details.vin,
      licensePlate: details.licensePlate,
      vehicleType: details.type,
      status: details.status,
      passengers: details.passengers,
      doors: details.doors,
      fuelType: details.fuelType,
      transmission: details.transmission
    };
    this.vehicleService.updateVehicle(vehicleId, payload).subscribe({
      next: () => {
        alert('Vehicle details saved successfully!');
      },
      error: () => {
        alert('Failed to save vehicle details.');
      }
    });
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  isDarkMode() {
    return this.isDarkModeActive();
  }

  toggleEquipment(index: number) {
    const items = this.equipment();
    const equipmentId = this.equipmentList()[index]?.id;
    const vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    if (!equipmentId || !vehicleId) return;

    // If currently enabled, user is unchecking (turning OFF) -> DELETE
    if (items[index].enabled) {
      this.vehicleService.removeEquipmentFromVehicle(vehicleId, equipmentId).subscribe({
        next: () => {},
        error: () => { alert('Failed to remove equipment'); }
      });
    } else {
      // If currently disabled, user is checking (turning ON) -> POST
      this.vehicleService.assignEquipmentToVehicle(vehicleId, equipmentId).subscribe({
        next: () => {},
        error: () => { alert('Failed to assign equipment'); }
      });
    }
    // Toggle the state after API call
    items[index].enabled = !items[index].enabled;
    this.equipment.set([...items]);
  }

  deleteMediaItem(id: number) {
    const items = this.vehicleMediaList().filter(item => item.id !== id);
    this.vehicleMediaList.set(items);
  }

  setCoverImage(id: number) {
    const items = this.vehicleMediaList().map(item => {
      item.isCover = item.id === id;
      return item;
    });
    this.vehicleMediaList.set(items);
  }

  async onPlaceholderClick(mediaType: string) {
    // Create a hidden file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = mediaType.includes('VIDEO') ? 'video/*' : 'image/*';

    input.onchange = async (event: any) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const vehicleId = Number(this.route.snapshot.paramMap.get('id'));

      // Extract file extension
      const fileExtension = file.name.split('.').pop() || '';
      const fileName = file.name;

      try {
        // Step 1: Create media metadata
        const mediaData = {
          vehicleId: vehicleId,
          fileName: fileName,
          fileType: fileExtension,
          vehicleMediaType: mediaType
        };

        const response = await this.vehicleService.createVehicleMedia(vehicleId, mediaData).toPromise();

        if (response && response.id) {
          // Step 2: Upload the actual file
          await this.vehicleService.uploadVehicleMediaFile(vehicleId, response.id, file, fileName).toPromise();

          // Step 3: Reload media to show the newly uploaded file
          this.loadVehicleMedia();

          console.log('Media uploaded successfully');
        }
      } catch (error) {
        console.error('Failed to upload media:', error);
        alert('Failed to upload media. Please try again.');
      }
    };

    // Trigger file selection
    input.click();
  }

  async loadVehicleImages() {
    const vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    this.vehicleService.getVehicleMedia(vehicleId).subscribe(async media => {
      let imageUrls: string[] = [];
      if (media && media.length > 0) {
        const imageTypes = [
          'COVER_IMAGE', 'FRONT_IMAGE', 'BACK_IMAGE', 'SIDE_IMAGE', 'INTERIOR_IMAGE'
        ];
        const imageMedia = media.filter((item: any) => imageTypes.includes(item.vehicleMediaType));
        const imagePromises = imageMedia.map(async (item: any) => {
          try {
            const blob = await this.vehicleService.downloadVehicleMedia(vehicleId, item.id).toPromise();
            return window.URL.createObjectURL(blob!);
          } catch {
            return null;
          }
        });
        imageUrls = (await Promise.all(imagePromises)).filter(url => url !== null);
      }
      // Force update vehicleDetails signal for Angular reactivity
      const details = this.vehicleDetails();
      if (details) {
        this.vehicleDetails.set({ ...details, images: imageUrls });
      }
    });
  }

  async loadPricingData() {
    this.isPricingLoading.set(true);
    const vehicleId = Number(this.route.snapshot.paramMap.get('id'));

    try {
      // Load all pricing categories
      const categories = await this.vehicleService.getAllPricingCategories().toPromise();
      this.pricingCategories.set(categories || []);

      // Load active pricing for this vehicle
      try {
        const activeCategory = await this.vehicleService.getActiveVehiclePricing(vehicleId).toPromise();
        this.activePricingCategory.set(activeCategory);
      } catch (error) {
        // Vehicle might not have active pricing yet
        console.log('No active pricing found for vehicle:', error);
        this.activePricingCategory.set(null);
      }
    } catch (error) {
      console.error('Failed to load pricing data:', error);
      alert('Failed to load pricing data.');
    } finally {
      this.isPricingLoading.set(false);
    }
  }

  isActivePricingCategory(categoryId: number): boolean {
    const active = this.activePricingCategory();
    return active?.pricingCategory?.id === categoryId;
  }

  async onPricingCategoryChange(newCategoryId: number) {
    const vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    const currentActive = this.activePricingCategory();

    try {
      // If there's a current active pricing, remove it first using the pricing ID (not category ID)
      if (currentActive?.id) {
        // Use the pricing relation ID from the active pricing response
        await this.vehicleService.removePricingFromVehicle(vehicleId, currentActive.id).toPromise();
      }

      // Assign new pricing category
      await this.vehicleService.assignPricingToVehicle(vehicleId, newCategoryId).toPromise();

      // Reload pricing data to reflect changes
      await this.loadPricingData();
    } catch (error) {
      console.error('Failed to update pricing category:', error);
      alert('Failed to update pricing category. Please try again.');
    }
  }
}
