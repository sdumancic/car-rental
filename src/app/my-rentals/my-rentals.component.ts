import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStore } from '../services/app.store';
import { FooterNavComponent } from '../footer-nav/footer-nav.component';

@Component({
  selector: 'app-my-rentals',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterNavComponent],
  templateUrl: './my-rentals.component.html',
  styleUrls: ['./my-rentals.component.scss']
})
export class MyRentalsComponent {
  // Inject the store
  activeRental: any;
  isDarkMode: any;

  constructor(
    private store: AppStore,
    private router: Router
  ) {
    this.activeRental = this.store.activeRental; // signal
    this.isDarkMode = this.store.isDarkMode; // signal
  }

  onViewDetails() {
    console.log('Viewing rental details...');
    // Navigate to rental details page
    this.router.navigate(['/reservation-details']);
  }

  onReturnCar() {
    console.log('Returning car...');
    // Navigate to return car page
    this.router.navigate(['/return-car']);
  }

  onViewHistory() {
    console.log('Viewing rental history...');
    // Navigate to rental history page
    this.router.navigate(['/rental-history']);
  }

  onMenuClick() {
    console.log('Menu clicked');
    // Show menu options
  }

  navigateToSearch() {
    this.router.navigate(['/search']);
  }

  navigateToRentals() {
    this.router.navigate(['/rentals']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  toggleDarkMode() {
    this.store.toggleDarkMode();
  }
}
