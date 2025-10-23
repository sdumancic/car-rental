import { Routes } from '@angular/router';
import { userAuthGuard } from './guards/user-auth.guard';
import { adminAuthGuard } from './guards/admin-auth.guard';

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
    loadComponent: () => import('./car-search/car-search.component').then(m => m.CarSearchComponent),
    canActivate: [userAuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'reservation-details',
    loadComponent: () => import('./reservation-details/reservation-details.component').then(m => m.ReservationDetailsComponent),
    canActivate: [userAuthGuard]
  },
  {
    path: 'reservation-details/:id',
    loadComponent: () => import('./reservation-details/reservation-details.component').then(m => m.ReservationDetailsComponent),
    canActivate: [userAuthGuard]
  },
  {
    path: 'payment',
    loadComponent: () => import('./payment/payment.component').then(m => m.PaymentComponent),
    canActivate: [userAuthGuard]
  },
  {
    path: 'return-car/:id',
    loadComponent: () => import('./return-car/return-car.component').then(m => m.ReturnCarComponent),
    canActivate: [userAuthGuard]
  },
  {
    path: 'my-rentals',
    loadComponent: () => import('./my-rentals/my-rentals.component').then(m => m.MyRentalsComponent),
    canActivate: [userAuthGuard]
  },
  {
    path: 'rental-history',
    loadComponent: () => import('./rental-history/rental-history.component').then(m => m.RentalHistoryComponent),
    canActivate: [userAuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [userAuthGuard]
  },
  {
    path: 'admin-car-overview',
    loadComponent: () => import('./admin-car-overview/admin-car-overview').then(m => m.AdminCarOverviewComponent),
    canActivate: [adminAuthGuard]
  },
  {
    path: 'admin-car-details',
    loadComponent: () => import('./admin-car-details/admin-car-details').then(m => m.AdminCarDetailsComponent),
    canActivate: [adminAuthGuard]
  },
  {
    path: 'admin-create-car',
    loadComponent: () => import('./admin-create-car/admin-create-car').then(m => m.AdminCreateCarComponent),
    canActivate: [adminAuthGuard]
  },
  {
    path: 'admin-car-details/:id',
    loadComponent: () => import('./admin-car-details/admin-car-details').then(m => m.AdminCarDetailsComponent),
    canActivate: [adminAuthGuard]
  }
];

