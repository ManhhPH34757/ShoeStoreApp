import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../class/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private categoryAPI: string = 'http://localhost:8080/api/categories';

  constructor(private httpClient: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(`${this.categoryAPI}`);
  }

  getCategory(id: number): Observable<Category> {
    return this.httpClient.get<Category>(`${this.categoryAPI}/${id}`);
  }
}
