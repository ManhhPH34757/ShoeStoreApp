import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sizes } from '../class/sizes';

@Injectable({
  providedIn: 'root'
})
export class SizeService {

  private sizeAPI: string = 'http://localhost:8080/api/sizes';

  constructor(private httpClient: HttpClient) { }

  getSizes(): Observable<Sizes[]> {
    return this.httpClient.get<Sizes[]>(this.sizeAPI);
  }
}
