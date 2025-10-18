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
  }
];

