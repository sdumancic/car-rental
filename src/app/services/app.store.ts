import { Injectable, signal, computed, effect } from '@angular/core';

// Interfaces
export interface Address {
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePicture: string;
  memberSince: string;
  licenseFile: {
    name: string;
    uploadDate: string;
  };
  homeAddress: Address;
  billingAddress: Address;
}

export interface Car {
  seats: number;
  bags: number;
  type: string;
  model: string;
  price: number;
  imageUrl?: string;
}

export interface Rental {
  carName: string;
  carType: string;
  imageUrl: string;
  pickupDate: string;
  pickupLocation: string;
  returnDate: string;
  returnLocation: string;
}

export interface PaymentData {
  paymentMethod: string;
  cardDetails: {
    cardNumber: string;
    expiryDate: string;
    cvc: string;
    nameOnCard: string;
  };
  billingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  totalAmount: number;
}

export interface SearchCriteria {
  location: string;
  startDate: string;
  endDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppStore {
  // Theme state
  private _darkMode = signal<boolean>(this.isDarkModePreferred());
  darkMode = this._darkMode.asReadonly();

  // User profile state
  private _userProfile = signal<UserProfile>({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@email.com',
    phoneNumber: '+1 234 567 890',
    profilePicture: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHTArz5W2CXOf2j3icNWzFegNvBtTD6jqOulNbe04z3CsUxwAY5lPCejmOWCJoYt7APdjo_Fqw-mSFS7FNZuK89wfQ8jKnp20QKMbcy3aYPpPHYSrsRHTUJRIgpdpDFalhTUWcC0OTDt7Jbw541Fi_-KoSdjN8vXkcWmfqA4pFv1M3hda_v5dcTDgkKN1u7s-gEEFyEM_2rhfdaFixwXtX3JQqZxtbhGC9AHUrgDN9uWozKY56S2GcZhyM-vHdtbOaLwYZFgNorkNI',
    memberSince: '2023',
    licenseFile: {
      name: 'license_scan.pdf',
      uploadDate: '15 Mar 2024'
    },
    homeAddress: {
      street: 'Lerchenauer Str.',
      houseNumber: '12',
      zipCode: '80809',
      city: 'Munich'
    },
    billingAddress: {
      street: 'Lerchenauer Str.',
      houseNumber: '12',
      zipCode: '80809',
      city: 'Munich'
    }
  });
  userProfile = this._userProfile.asReadonly();

  // Cars state
  private _cars = signal<Car[]>([
    { seats: 4, bags: 2, type: 'Economy', model: 'Nissan Versa or similar', price: 45 },
    { seats: 5, bags: 3, type: 'Compact', model: 'Toyota Corolla or similar', price: 55 },
    { seats: 5, bags: 4, type: 'Midsize', model: 'Honda Accord or similar', price: 65 }
  ]);
  cars = this._cars.asReadonly();

  // Active rental state
  private _activeRental = signal<Rental | null>({
    carName: 'Nissan Versa',
    carType: 'or similar',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0HvsG4bHBm9apLu5oQjIKnXDSoosP4LCBIsVvGaCJp6LDHvs3BETBKSCdgXcuvBe004CsEx86ITkBqTHCTlvy286M_qjtsz6QI0zJHUa1ssXAQ6RaQeygKztl091Za85UYbTOnj5GQPwBp4rnevh5eA-Z_losPraHHjGyW6f07ygFL1UkOGfaYAriawrIXMJMn6XeKxzfGCjTzLqcXg2Y5jvGnz4P9baunOZHBoUW8zUv7O9xHlVp-6pQ401G7e_JVTBYlktsIdFH',
    pickupDate: 'May 25, 2024 - 10:00 AM',
    pickupLocation: 'JFK Airport',
    returnDate: 'May 30, 2024 - 10:00 AM',
    returnLocation: 'JFK Airport'
  });
  activeRental = this._activeRental.asReadonly();

  // Payment data state
  private _paymentData = signal<PaymentData>({
    paymentMethod: 'credit-card',
    cardDetails: {
      cardNumber: '',
      expiryDate: '',
      cvc: '',
      nameOnCard: ''
    },
    billingAddress: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    totalAmount: 250
  });
  paymentData = this._paymentData.asReadonly();

  // Search criteria state
  private _searchCriteria = signal<SearchCriteria>({
    location: '',
    startDate: '',
    endDate: ''
  });
  searchCriteria = this._searchCriteria.asReadonly();

  // UI state
  private _activeTab = signal<string>('search');
  activeTab = this._activeTab.asReadonly();

  private _activeFilter = signal<string | null>(null);
  activeFilter = this._activeFilter.asReadonly();

  // Computed signals
  isDarkMode = computed(() => this._darkMode());

  // Effects for side effects
  constructor() {
    // Initialize theme
    this.initializeTheme();

    // Effect to save dark mode to localStorage
    effect(() => {
      localStorage.setItem('darkMode', this._darkMode().toString());
      this.updateTheme(this._darkMode());
    });
  }

  // Theme methods
  private isDarkModePreferred(): boolean {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private initializeTheme(): void {
    this.updateTheme(this._darkMode());

    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (localStorage.getItem('darkMode') === null) {
          this._darkMode.set(e.matches);
        }
      });
  }

  toggleDarkMode(): void {
    this._darkMode.set(!this._darkMode());
  }

  private updateTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // User profile methods
  updateUserProfile(profile: Partial<UserProfile>): void {
    this._userProfile.update(current => ({ ...current, ...profile }));
  }

  // Cars methods
  updateCars(cars: Car[]): void {
    this._cars.set(cars);
  }

  // Active rental methods
  updateActiveRental(rental: Partial<Rental>): void {
    this._activeRental.update(current => current ? { ...current, ...rental } : { ...rental } as Rental);
  }

  // Payment methods
  updatePaymentData(data: Partial<PaymentData>): void {
    this._paymentData.update(current => ({ ...current, ...data }));
  }

  updatePaymentMethod(method: string): void {
    this._paymentData.update(current => ({ ...current, paymentMethod: method }));
  }

  updateCardDetails(details: Partial<PaymentData['cardDetails']>): void {
    this._paymentData.update(current => ({
      ...current,
      cardDetails: { ...current.cardDetails, ...details }
    }));
  }

  updateBillingAddress(address: Partial<PaymentData['billingAddress']>): void {
    this._paymentData.update(current => ({
      ...current,
      billingAddress: { ...current.billingAddress, ...address }
    }));
  }

  // Search criteria methods
  updateSearchCriteria(criteria: Partial<SearchCriteria>): void {
    this._searchCriteria.update(current => ({ ...current, ...criteria }));
  }

  // UI methods
  setActiveTab(tab: string): void {
    this._activeTab.set(tab);
  }

  setActiveFilter(filter: string | null): void {
    this._activeFilter.set(filter);
  }
}
