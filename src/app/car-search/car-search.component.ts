import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppStore, Car, SearchCriteria } from '../services/app.store';
import { FooterNavComponent } from '../footer-nav/footer-nav.component';

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

  constructor(private store: AppStore, private router: Router) {
    this.activeTab = this.store.activeTab;
    this.activeFilter = this.store.activeFilter;
    this.cars = this.store.cars;
    this.searchCriteria = this.store.searchCriteria;
    this.isDarkMode = this.store.isDarkMode;
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
    console.log('Searching with criteria:', this.searchCriteria);
    // Implement search logic here
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

  get startDate(): string {
    return this.searchCriteria().startDate;
  }

  set startDate(value: string) {
    this.store.updateSearchCriteria({ startDate: value });
  }

  get endDate(): string {
    return this.searchCriteria().endDate;
  }

  set endDate(value: string) {
    this.store.updateSearchCriteria({ endDate: value });
  }

  selectCar(car: Car) {
    console.log('Selected car:', car);
    // Možete ovdje dodati logiku za odabir vozila
    // Na primjer: spremiti odabrano vozilo u store ili navigirati na stranicu rezervacije
    this.store.setSelectedCar(car);
    this.router.navigate(['/reservation-details']);
  }
}
