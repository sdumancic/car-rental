import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly baseUrl = 'http://localhost:8090/v1/vehicles';

  constructor(private http: HttpClient) {}

  searchVehicles(params: {
    make?: string;
    model?: string;
    year?: number;
    vehicleType?: string;
    passengers?: number;
    doors?: number;
    fuelType?: string;
    transmission?: string;
    sort?: string;
    page?: number;
    size?: number;
    reservationStart?: string;
    reservationEnd?: string;
  }): Observable<any> {
    // Remove undefined and empty values
    const cleanParams: any = {};
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    });
    return this.http.get<any>(this.baseUrl, { params: cleanParams });
  }

  createVehicle(vehicle: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, vehicle);
  }

  getVehicleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getVehiclePricing(vehicleId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${vehicleId}/pricing/active`);
  }

  calculateVehiclePricing(vehicleId: number, days: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${vehicleId}/pricing/calculate`, {
      params: { days: days.toString() }
    });
  }

  getVehicleEquipment(vehicleId: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8090/v1/vehicle-equipment`, { params: { vehicleId } });
  }

  getVehicleMedia(vehicleId: number) {
    return this.http.get<any[]>(`http://localhost:8090/v1/vehicles/${vehicleId}/media/all`);
  }

  downloadVehicleMedia(vehicleId: number, mediaId: number) {
    return this.http.get(`http://localhost:8090/v1/vehicles/${vehicleId}/media/${mediaId}/download`, { responseType: 'blob' });
  }

  createVehicleMedia(vehicleId: number, mediaData: any): Observable<any> {
    return this.http.post<any>(`http://localhost:8090/v1/vehicles/${vehicleId}/media`, mediaData);
  }

  uploadVehicleMediaFile(vehicleId: number, mediaId: number, file: File, fileName: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    return this.http.post<any>(`http://localhost:8090/v1/vehicles/${vehicleId}/media/${mediaId}/upload`, formData);
  }

  assignEquipmentToVehicle(vehicleId: number, equipmentId: number) {
    return this.http.post('http://localhost:8090/v1/vehicle-equipment', {
      vehicleId,
      equipmentId
    });
  }

  removeEquipmentFromVehicle(vehicleId: number, equipmentId: number) {
    return this.http.delete(`http://localhost:8090/v1/vehicle-equipment/${vehicleId}/${equipmentId}`, {
      body: { vehicleId, equipmentId },
      headers: { 'Content-Type': 'application/json' }
    });
  }

  updateVehicle(vehicleId: number, vehicleData: any) {
    return this.http.put(`http://localhost:8090/v1/vehicles/${vehicleId}`, vehicleData, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  createReservation(reservationData: {
    userId: number;
    vehicleId: number;
    startDate: string;
    endDate: string;
  }): Observable<any> {
    return this.http.post<any>('http://localhost:8090/v1/reservations', reservationData, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  payReservation(reservationId: number, reservation: any): Observable<any> {
    return this.http.post<any>(`http://localhost:8090/v1/reservations/${reservationId}/payment`, reservation, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getUserReservations(params: {
    userId: number;
    status?: string;
    page?: number;
    size?: number;
  }): Observable<any> {
    const cleanParams: any = {};
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    });
    return this.http.get<any>('http://localhost:8090/v1/reservations', { params: cleanParams });
  }

  completeReservation(reservationId: number): Observable<any> {
    return this.http.post<any>(`http://localhost:8090/v1/reservations/${reservationId}/complete`, {});
  }

  getRentalHistory(params: {
    userId: number;
    page?: number;
    size?: number;
    sort?: string;
  }): Observable<any> {
    const cleanParams: any = {};
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    });
    return this.http.get<any>('http://localhost:8090/v1/reservations', { params: cleanParams });
  }
}
