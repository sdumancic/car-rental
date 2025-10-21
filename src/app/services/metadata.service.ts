import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppStore } from './app.store';

@Injectable({ providedIn: 'root' })
export class MetadataService {
  private readonly baseUrl = 'http://localhost:8090/v1/metadata';

  constructor(private http: HttpClient, private appStore: AppStore) {}

  async fetchMakes() {
    const makes = await this.http.get<string[]>(`${this.baseUrl}/makes`).toPromise();
    this.appStore.setMakes(makes || []);
  }

  async fetchModels(make: string) {
    const models = await this.http.get<string[]>(`${this.baseUrl}/models?make=${encodeURIComponent(make)}`).toPromise();
    this.appStore.setModels(models || []);
  }

  async fetchVehicleTypes() {
    const types = await this.http.get<string[]>(`${this.baseUrl}/vehicle-types`).toPromise();
    this.appStore.setVehicleTypes(types || []);
  }

  async fetchTransmissionTypes() {
    const transmissions = await this.http.get<string[]>(`${this.baseUrl}/transmission-types`).toPromise();
    this.appStore.setTransmissionTypes(transmissions || []);
  }

  async fetchFuelTypes() {
    const fuels = await this.http.get<string[]>(`${this.baseUrl}/fuel-types`).toPromise();
    this.appStore.setFuelTypes(fuels || []);
  }

  async fetchVehicleStatuses() {
    const statuses = await this.http.get<string[]>(`${this.baseUrl}/vehicle-statuses`).toPromise();
    this.appStore.setVehicleStatuses(statuses || []);
  }

  async fetchEquipments() {
    return await this.http.get<any[]>(`http://localhost:8090/v1/equipment`).toPromise();
  }

  async fetchAllMetadata() {
    await Promise.all([
      this.fetchMakes(),
      this.fetchVehicleTypes(),
      this.fetchTransmissionTypes(),
      this.fetchFuelTypes(),
      this.fetchVehicleStatuses()
    ]);
  }
}
