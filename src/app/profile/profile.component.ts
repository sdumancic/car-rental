import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStore } from '../services/app.store';
import { FooterNavComponent } from '../footer-nav/footer-nav.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterNavComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  // Inject the store
  userProfile: any;
  isDarkMode: any;

  // Dialog states
  showChangePasswordDialog = signal(false);
  showDeactivateDialog = signal(false);

  constructor(
    private store: AppStore,
    private router: Router
  ) {
    this.userProfile = this.store.userProfile;
    this.isDarkMode = this.store.isDarkMode;
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
