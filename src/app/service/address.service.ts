import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private provincesUrl = `${environment.apiUrl}/api/province/`;
  private districtsUrl = `${environment.apiUrl}/api/province/district/{provinceId}`;
  private wardsUrl = `${environment.apiUrl}/api/province/ward/{districtId}`;

  constructor(private http: HttpClient) { }

  getProvinces(): Observable<any> {
    return this.http.get<any>(this.provincesUrl);
  }

  getDistricts(provinceId: string): Observable<any> {
    const url = this.districtsUrl.replace('{provinceId}', provinceId);
    return this.http.get<any>(url);
  }

  getWards(districtId: string): Observable<any> {
    const url = this.wardsUrl.replace('{districtId}', districtId);
    return this.http.get<any>(url);
  }
}
