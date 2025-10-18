import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStore } from '../services/app.store';
import { ThemeService } from '../services/theme.service'
import { FooterNavComponent } from '../footer-nav/footer-nav.component'

interface PastRental {
  id: number;
  carName: string;
  carType: string;
  imageUrl: string;
  dateRange: string;
  location: string;
  totalCost: number;
}

@Component({
  selector: 'app-rental-history',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterNavComponent],
  templateUrl: './rental-history.component.html',
  styleUrls: ['./rental-history.component.scss']
})
export class RentalHistoryComponent {
  // Past rentals data
  pastRentals: PastRental[] = [
    {
      id: 1,
      carName: 'Jeep Grand Cherokee',
      carType: 'or similar',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBms4qOd6jnxBAxT_TlbHFGG6W-APrBA6Ki879ICoJNFrIgq6XWcHEtFsT2B-sFKEsjnAjKDV4pIdqIp33HAStcvDko-C3608_9e7ruW3n2zPiMhkG3sEykrgJClZS-IlcJnhAF4Jj4jFpi3_hytjfx-mB8VZXebkMSs73YppQC_aN-hP-yvr3IMGMRLRrpMlKSJ_7sCMiK3zd52NhLuwWuXKsRlg32pvOMVMvAmxCFBET7umE_zfanMrs6KtfJFlHsZlXiT_jFH7yR',
      dateRange: 'March 15 - 20, 2024',
      location: 'MIA Airport',
      totalCost: 450.78
    },
    {
      id: 2,
      carName: 'Toyota Camry',
      carType: 'or similar',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5IMXfGtQrPsEF4m3IrgexmIMIfa_qnfoRTdVS1F6-BOGWcWUCV6GajgrRxRAj_QeZ5a-RUGX6GEMJh9EotB012OmdJhkNK8okxmpiCvCjLDy9tvCvK25QQRj9ALDCiOY2_NoLe1SEDydjNTLY5kkrI70ahNqmPPnTkSML8ztdIDj9JAG0JcDdciUP31lnTkWomN939VCFGZ6gOl7MytWEwn0uvjNU2u_BQIYqOmqiNPaRlIP0-R5WVeZoc9-rNJxCx0h-JGt97PS9',
      dateRange: 'Jan 10 - 12, 2024',
      location: 'LAX Airport',
      totalCost: 210.50
    },
    {
      id: 3,
      carName: 'Ford Mustang',
      carType: 'or similar',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZch7wFD2xq4grTPfHHwaVpqO4wRfHeMAF8KvGtirdJOIWpYaXE3Kf9m38H355XctFE4K2GeMHc6SIjtE8HYCgAUN2Sfc3H67bTKcE_YoDNv5yUKwM5UPxZNvke53YqWvfKEC7A0578gSqUUQXcv1PBj1IxbRGhAdMo0YR8KP27vMvzbGfOp7MyqmRQJUPib6a8wzLVh4UgZUZb8SDnlKQpvEM2-ZiP8C1uyu2kIrIJVlQmjYpvAZu4jnf3o2_uaRVU4cKoy37zSt7',
      dateRange: 'Nov 22 - 25, 2023',
      location: 'JFK Airport',
      totalCost: 320.00
    }
  ];

  // Create a computed signal for dark mode state
  isDarkModeActive = computed(() => this.themeService.darkMode());

  constructor(
    public themeService: ThemeService,
    private router: Router
  ) {}

  goBack() {
    this.router.navigate(['/my-rentals']);
  }

  onSort() {
    console.log('Sort clicked');
    // Implement sort logic here
  }

  onFilter() {
    console.log('Filter clicked');
    // Implement filter logic here
  }

  onRentalClick(rental: PastRental) {
    console.log('Rental clicked:', rental);
    // Navigate to rental details
    // this.router.navigate(['/rental-details', rental.id]);
  }

  navigateToSearch() {
    this.router.navigate(['/search']);
  }

  navigateToRentals() {
    this.router.navigate(['/my-rentals']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  isDarkMode() {
    return this.isDarkModeActive();
  }
}

