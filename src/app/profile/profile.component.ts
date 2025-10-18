import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';

interface UserProfile {
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
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  // User profile data
  userProfile: UserProfile = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@email.com',
    phoneNumber: '+1 234 567 890',
    profilePicture: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHTArz5W2CXOf2j3icNWzFegNvBtTD6jqOulNbe04z3CsUxwAY5lPCejmOWCJoYt7APdjo_Fqw-mSFS7FNZuK89wfQ8jKnp20QKMbcy3aYPpPHYSrsRHTUJRIgpdpDFalhTUWcC0OTDt7Jbw541Fi_-KoSdjN8vXkcWmfqA4pFv1M3hda_v5dcTDgkKN1u7s-gEEFyEM_2rhfdaFixwXtX3JQqZxtbhGC9AHUrgDN9uWozKY56S2GcZhyM-vHdtbOaLwYZFgNorkNI',
    memberSince: '2023',
    licenseFile: {
      name: 'license_scan.pdf',
      uploadDate: '15 Mar 2024'
    }
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

  onEditProfilePicture() {
    console.log('Edit profile picture clicked');
    // Implement file picker for profile picture
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0] as File;
      if (file) {
        console.log('Profile picture selected:', file.name);
        // Handle profile picture upload
      }
    };

    fileInput.click();
  }

  onReuploadLicense() {
    console.log('Re-upload license clicked');
    // Implement file picker for license
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf,image/*';

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0] as File;
      if (file) {
        console.log('License file selected:', file.name);
        // Handle license upload
      }
    };

    fileInput.click();
  }

  onChangePassword() {
    console.log('Change password clicked');
    // Navigate to change password page or show modal
    // this.router.navigate(['/change-password']);
  }

  onLogout() {
    console.log('Logout clicked');
    // Implement logout logic
    // this.router.navigate(['/welcome']);
  }

  onDeactivateAccount() {
    console.log('Deactivate account clicked');
    // Show confirmation dialog and handle account deactivation
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

