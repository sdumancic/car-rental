import { Component, computed, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStore } from '../services/app.store';
import { VehicleService } from '../services/vehicle.service';

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

  // Total amount from reservation
  totalAmount = signal<number>(0);

  constructor(
    private store: AppStore,
    private router: Router,
    private location: Location,
    private vehicleService: VehicleService
  ) {
    this.paymentData = this.store.paymentData;
    this.isDarkMode = this.store.isDarkMode;

    // Učitavam billing address iz rezervacije
    this.loadBillingAddressFromReservation();
    // Učitavam total amount iz rezervacije
    this.loadTotalAmountFromReservation();
  }

  loadBillingAddressFromReservation() {
    const reservation = this.store.currentReservation();

    if (reservation && reservation.user && reservation.user.billingAddress) {
      const billingAddr = reservation.user.billingAddress;

      // Formatiram adresu za payment formu
      const address = `${billingAddr.street} ${billingAddr.houseNumber}`;
      const city = billingAddr.city;
      const zipCode = billingAddr.zipcode;

      // Ažuriram billing address u store
      this.store.updateBillingAddress({
        address: address,
        city: city,
        state: '', // State nije dostupan u API responsu
        zipCode: zipCode
      });

      console.log('Loaded billing address from reservation:', {
        address,
        city,
        zipCode
      });
    }
  }

  loadTotalAmountFromReservation() {
    const reservation = this.store.currentReservation();

    if (reservation && reservation.price) {
      // Rezervacija ima cijenu, dodajem takse (25$)
      const totalWithTaxes = reservation.price + 25;
      this.totalAmount.set(totalWithTaxes);

      console.log('Loaded total amount from reservation:', totalWithTaxes);
    } else {
      // Fallback na fiksni iznos ako nema rezervacije
      this.totalAmount.set(250);
    }
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

  async onSubmit() {
    console.log('Processing payment...');

    const reservation = this.store.currentReservation();

    if (!reservation || !reservation.id) {
      alert('Reservation data is missing. Please try again.');
      return;
    }

    // Start processing
    this.isProcessing.set(true);

    try {
      console.log('Calling payment endpoint for reservation:', reservation.id);

      // Pozivam payment endpoint sa cijelim sadržajem rezervacije
      const paymentResponse = await this.vehicleService.payReservation(reservation.id, reservation).toPromise();

      console.log('Payment successful:', paymentResponse);

      // Stop processing and show success
      this.isProcessing.set(false);
      this.paymentSuccess.set(true);

      // After 2 seconds, redirect to my-rentals
      setTimeout(() => {
        this.router.navigate(['/my-rentals']);
      }, 2000);

    } catch (error) {
      console.error('Payment error:', error);
      this.isProcessing.set(false);
      alert('Payment failed. Please try again.');
    }
  }

  toggleDarkMode() {
    this.store.toggleDarkMode();
  }
}
