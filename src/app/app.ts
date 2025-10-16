import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarSearchComponent } from './car-search/car-search.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CarSearchComponent],
  template: `<app-car-search></app-car-search>`
})
export class App {}
