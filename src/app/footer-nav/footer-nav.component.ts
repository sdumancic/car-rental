import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer-nav.component.html',
  styleUrls: []
})
export class FooterNavComponent {
  items = [
    { name: 'Search', icon: 'search' },
    { name: 'Rentals', icon: 'car' },
    { name: 'Profile', icon: 'user' }
  ];

  constructor(private router: Router) {}

  navigateToSearch() {
    this.router.navigate(['/search']);
  }

  navigateToRentals() {
    this.router.navigate(['/my-rentals']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}
