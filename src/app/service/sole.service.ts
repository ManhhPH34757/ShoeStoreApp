import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sole } from '../class/sole';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SoleService {
  private soleAPI: string = 'http://localhost:8080/api/soles'

  constructor(private httpClient: HttpClient) { }

  getSoles(): Observable<Sole[]> {
    return this.httpClient.get<Sole[]>(`${this.soleAPI}`);
  }

  getSole(id: number): Observable<Sole> {
    return this.httpClient.get<Sole>(`${this.soleAPI}/${id}`);
  }
  
}
