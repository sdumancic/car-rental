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

  createVehicle(vehicle: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, vehicle);
  }

  getVehicleById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
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
}
