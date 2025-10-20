import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly baseUrl = 'http://localhost:8090/v1/vehicles';

  constructor(private http: HttpClient) {}

  searchVehicles(params: any): Observable<any> {
    // Remove undefined values
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
    return this.http.get<any>(this.baseUrl, { params });
  }
}

