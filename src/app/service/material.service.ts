import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Material } from '../class/material';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private materialAPI: string = 'http://localhost:8080/api/materials';

  constructor(private httpClient: HttpClient) {}

  getMaterials(): Observable<Material[]> {
    return this.httpClient.get<Material[]>(`${this.materialAPI}`);
  }

  getMaterial(id: number): Observable<Material> {
    return this.httpClient.get<Material>(`${this.materialAPI}/${id}`);
  }
}
