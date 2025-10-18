import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-return-car',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './return-car.component.html',
  styleUrls: ['./return-car.component.scss']
})
export class ReturnCarComponent {
  // Car condition report
  conditionReport = '';

  // Photos object for each position
  photos = {
    front: null as File | null,
    back: null as File | null,
    leftSide: null as File | null,
    rightSide: null as File | null,
    mileage: null as File | null
  };

  // Create a computed signal for dark mode state
  isDarkModeActive = computed(() => this.themeService.darkMode());

  constructor(
    public themeService: ThemeService,
    private router: Router
  ) {}

  goBack() {
    this.router.navigate(['/search']);
  }

  onAddPhoto(position: 'front' | 'back' | 'leftSide' | 'rightSide' | 'mileage') {
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = false;

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0] as File;
      if (file) {
        this.photos[position] = file;
        console.log(`Photo added for ${position}:`, file.name);
      }
    };

    fileInput.click();
  }

  hasPhoto(position: 'front' | 'back' | 'leftSide' | 'rightSide' | 'mileage'): boolean {
    return this.photos[position] !== null;
  }

  onSubmit() {
    console.log('Submitting return car form...');
    console.log('Condition report:', this.conditionReport);
    console.log('Photos:', this.photos);
    // Implement submission logic here
    // After successful submission, navigate to confirmation or search
    // this.router.navigate(['/search']);
  }

  navigateToSearch() {
    this.router.navigate(['/search']);
  }

  navigateToRentals() {
    this.router.navigate(['/return-car']);
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
