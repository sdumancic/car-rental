import { Component, computed, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStore } from '../services/app.store';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
  // Inject the store
  paymentData: any;
  isDarkMode: any;

  // Payment processing state
  isProcessing = signal(false);
  paymentSuccess = signal(false);

  constructor(
    private store: AppStore,
    private router: Router,
    private location: Location
  ) {
    this.paymentData = this.store.paymentData;
    this.isDarkMode = this.store.isDarkMode;
  }

  goBack() {
    this.location.back();
  }

  onPaymentMethodChange(method: string) {
    this.store.updatePaymentMethod(method);
    console.log('Payment method changed to:', method);
  }

  onCardDetailsChange(details: any) {
    this.store.updateCardDetails(details);
  }

  onBillingAddressChange(address: any) {
    this.store.updateBillingAddress(address);
  }

  updateCardNumber(value: string) {
    this.store.updateCardDetails({ cardNumber: value });
  }

  updateExpiryDate(value: string) {
    this.store.updateCardDetails({ expiryDate: value });
  }

  updateCvc(value: string) {
    this.store.updateCardDetails({ cvc: value });
  }

  updateNameOnCard(value: string) {
    this.store.updateCardDetails({ nameOnCard: value });
  }

  updateBillingAddressField(field: string, value: string) {
    const update = { [field]: value };
    this.store.updateBillingAddress(update);
  }

  onSubmit() {
    console.log('Processing payment...');

    // Start processing
    this.isProcessing.set(true);

    // After 3 seconds, show success message
    setTimeout(() => {
      this.isProcessing.set(false);
      this.paymentSuccess.set(true);

      // After additional 2 seconds, redirect to my-rentals
      setTimeout(() => {
        this.router.navigate(['/my-rentals']);
      }, 2000);
    }, 3000);
  }

  toggleDarkMode() {
    this.store.toggleDarkMode();
  }
}
