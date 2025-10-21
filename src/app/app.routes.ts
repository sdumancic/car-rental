import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'welcome',
    loadComponent: () => import('./welcome/welcome.component').then(m => m.WelcomeComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./car-search/car-search.component').then(m => m.CarSearchComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'reservation-details',
    loadComponent: () => import('./reservation-details/reservation-details.component').then(m => m.ReservationDetailsComponent)
  },
  {
    path: 'payment',
    loadComponent: () => import('./payment/payment.component').then(m => m.PaymentComponent)
  },
  {
    path: 'return-car',
    loadComponent: () => import('./return-car/return-car.component').then(m => m.ReturnCarComponent)
  },
  {
    path: 'my-rentals',
    loadComponent: () => import('./my-rentals/my-rentals.component').then(m => m.MyRentalsComponent)
  },
  {
    path: 'rental-history',
    loadComponent: () => import('./rental-history/rental-history.component').then(m => m.RentalHistoryComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'admin-car-overview',
    loadComponent: () => import('./admin-car-overview/admin-car-overview').then(m => m.AdminCarOverviewComponent)
  },
  {
    path: 'admin-car-details',
    loadComponent: () => import('./admin-car-details/admin-car-details').then(m => m.AdminCarDetailsComponent)
  },
  {
    path: 'admin-create-car',
    loadComponent: () => import('./admin-create-car/admin-create-car').then(m => m.AdminCreateCarComponent)
  },
  {
    path: 'admin-car-details/:id',
    loadComponent: () => import('./admin-car-details/admin-car-details').then(m => m.AdminCarDetailsComponent)
  }
];

