import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pay } from '../class/pay';

@Injectable({
  providedIn: 'root'
})
export class PayService {

  private payAPI = 'http://localhost:8080/api/pays';

  constructor(private httpClient: HttpClient) { }

  getPayById(id: number): Observable<Pay> {
    return this.httpClient.get<Pay>(this.payAPI + '/' + id);
  }
}
