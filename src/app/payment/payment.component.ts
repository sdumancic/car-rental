import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(
    private store: AppStore,
    private router: Router
  ) {
    this.paymentData = this.store.paymentData;
    this.isDarkMode = this.store.isDarkMode;
  }

  goBack() {
    this.router.navigate(['/reservation-details']);
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
    // Implement payment processing logic
    // this.paymentService.processPayment(this.paymentData());
  }

  toggleDarkMode() {
    this.store.toggleDarkMode();
  }
}
