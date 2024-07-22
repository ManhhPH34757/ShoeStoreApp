import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Brand } from '../class/brand';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private brandAPI: string = 'http://localhost:8080/api/brands';

  constructor(private httpClient: HttpClient) {}

  getBrands(): Observable<Brand[]> {
    return this.httpClient.get<Brand[]>(`${this.brandAPI}`);
  }

  getBrand(id: number): Observable<Brand> {
    return this.httpClient.get<Brand>(`${this.brandAPI}/${id}`);
  }
}
