import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
  // Payment method selection
  paymentMethod = 'credit-card';

  // Card details
  cardDetails = {
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    nameOnCard: ''
  };

  // Billing address
  billingAddress = {
    address: '',
    city: '',
    state: '',
    zipCode: ''
  };

  // Total amount (this would come from route params or service in real app)
  totalAmount = 250;

  // Create a computed signal for dark mode state
  isDarkModeActive = computed(() => this.themeService.darkMode());

  constructor(
    public themeService: ThemeService,
    private router: Router
  ) {}

  goBack() {
    this.router.navigate(['/reservation-details']);
  }

  onPaymentMethodChange(method: string) {
    this.paymentMethod = method;
    console.log('Payment method changed to:', method);
  }

  onPay() {
    console.log('Processing payment...');
    console.log('Payment method:', this.paymentMethod);
    console.log('Card details:', this.cardDetails);
    console.log('Billing address:', this.billingAddress);
    console.log('Amount:', this.totalAmount);
    // Implement payment logic here
    // After successful payment, navigate to confirmation
    // this.router.navigate(['/confirmation']);
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  isDarkMode() {
    return this.isDarkModeActive();
  }
}

