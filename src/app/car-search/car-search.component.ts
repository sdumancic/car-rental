import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../services/theme.service';

interface Car {
  seats: number;
  bags: number;
  type: string;
  model: string;
  price: number;
  imageUrl?: string;
}

@Component({
  selector: 'app-car-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './car-search.component.html',
  styleUrls: ['./car-search.component.scss']
})
export class CarSearchComponent {
  activeTab = signal<string>('search');
  activeFilter = signal<string | null>(null);
  cars = signal<Car[]>([
    { seats: 4, bags: 2, type: 'Economy', model: 'Nissan Versa or similar', price: 45 },
    { seats: 5, bags: 3, type: 'Compact', model: 'Toyota Corolla or similar', price: 55 },
    { seats: 5, bags: 4, type: 'Midsize', model: 'Honda Accord or similar', price: 65 }
  ]);

  searchCriteria = {
    location: '',
    startDate: '',
    endDate: ''
  };

  constructor(public themeService: ThemeService) {}

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
    this.activeTab.set(tab);
  }

  toggleFilter(filter: string) {
    if (this.activeFilter() === filter) {
      this.activeFilter.set(null);
    } else {
      this.activeFilter.set(filter);
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
    this.themeService.toggleDarkMode();
  }

  isDarkMode() {
    return this.themeService.isDarkMode();
  }
}
