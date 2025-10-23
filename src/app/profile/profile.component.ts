import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStore } from '../services/app.store';
import { FooterNavComponent } from '../footer-nav/footer-nav.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterNavComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  // User profile loaded from backend
  userProfile = signal<any>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    mobileNumber: '',
    profilePicture: 'https://via.placeholder.com/150',
    memberSince: '',
    licenseFile: {
      name: 'No license uploaded',
      uploadDate: 'N/A'
    },
    homeAddress: {
      street: '',
      houseNumber: '',
      zipCode: '',
      city: ''
    },
    billingAddress: {
      street: '',
      houseNumber: '',
      zipCode: '',
      city: ''
    }
  });

  isLoading = signal<boolean>(true);
  isDarkMode: any;

  // Dialog states
  showChangePasswordDialog = signal(false);
  showDeactivateDialog = signal(false);

  constructor(
    private store: AppStore,
    private router: Router,
    private authService: AuthService
  ) {
    this.isDarkMode = this.store.isDarkMode;
    this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      this.isLoading.set(true);
      const userId = this.authService.getUserId();

      if (!userId) {
        console.error('User not authenticated');
        this.router.navigate(['/welcome']);
        return;
      }

      const user = await this.authService.getUserById(userId).toPromise();
      console.log('User profile loaded:', user);

      if (user) {
        // Map backend user data to profile structure
        this.userProfile.set({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          mobileNumber: user.mobileNumber || '',
          profilePicture: user.profilePicture || 'https://via.placeholder.com/150',
          memberSince: user.dateCreated ? new Date(user.dateCreated).getFullYear().toString() : '',
          licenseFile: {
            name: user.driverLicense?.fileName || 'No license uploaded',
            uploadDate: user.driverLicense?.uploadDate ? new Date(user.driverLicense.uploadDate).toLocaleDateString() : 'N/A'
          },
          homeAddress: {
            street: user.homeAddress?.street || '',
            houseNumber: user.homeAddress?.houseNumber || '',
            zipCode: user.homeAddress?.zipcode || '',
            city: user.homeAddress?.city || ''
          },
          billingAddress: {
            street: user.billingAddress?.street || '',
            houseNumber: user.billingAddress?.houseNumber || '',
            zipCode: user.billingAddress?.zipcode || '',
            city: user.billingAddress?.city || ''
          }
        });
      }

      this.isLoading.set(false);
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.isLoading.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/search']);
  }

  onEditProfile() {
    console.log('Edit profile clicked');
    // Navigate to edit profile page or enable edit mode
    // this.router.navigate(['/profile/edit']);
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
        // For now, just update the store with a placeholder
        this.store.updateUserProfile({ profilePicture: URL.createObjectURL(file) });
      }
    };

    fileInput.click();
  }

  onReuploadLicense() {
    console.log('Re-upload license clicked');
    // Implement file picker for license
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.jpg,.png';

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0] as File;
      if (file) {
        console.log('License file selected:', file.name);
        // Update the store
        this.store.updateUserProfile({
          licenseFile: {
            name: file.name,
            uploadDate: new Date().toLocaleDateString()
          }
        });
      }
    };

    fileInput.click();
  }

  toggleDarkMode() {
    this.store.toggleDarkMode();
  }

  onChangePassword() {
    this.showChangePasswordDialog.set(true);
  }

  confirmChangePassword() {
    console.log('Password change link sent to email');
    // Implement password change logic
    this.showChangePasswordDialog.set(false);
  }

  cancelChangePassword() {
    this.showChangePasswordDialog.set(false);
  }

  onLogout() {
    console.log('Logout clicked');
    // Call AuthService to remove tokens from localStorage
    this.authService.logout();
    // Redirect to welcome page
    this.router.navigate(['/welcome']);
  }

  onDeactivateAccount() {
    this.showDeactivateDialog.set(true);
  }

  confirmDeactivateAccount() {
    console.log('Account deactivated');
    // Implement account deactivation logic
    this.showDeactivateDialog.set(false);
    this.router.navigate(['/welcome']);
  }

  cancelDeactivateAccount() {
    this.showDeactivateDialog.set(false);
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
}
