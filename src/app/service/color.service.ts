import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Color } from '../class/color';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  private colorAPI: string = 'http://localhost:8080/api/colors';

  constructor(private httpClient: HttpClient) { }

  getColors():Observable<Color[]> {
    return this.httpClient.get<Color[]>(this.colorAPI);
  }

}
