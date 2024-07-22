import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../class/product';
import { ProductDto } from '../class/product-dto';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private productAPI: string = 'http://localhost:8080/api/products';

  constructor(private httpClient:HttpClient) { }

  getProducts(): Observable<ProductDto[]> {
    return this.httpClient.get<ProductDto[]>(`${this.productAPI}`);
  }

  addProduct(product: Product): Observable<Product> {
    return this.httpClient.post<Product>(`${this.productAPI}`, product);
  }

  getProduct(id: number): Observable<Product> {
    return this.httpClient.get<Product>(`${this.productAPI}/${id}`);
  }

  updateProduct(product: Product): Observable<Product> {
    return this.httpClient.put<Product>(`${this.productAPI}/${product.id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.productAPI}/${id}`);
  }

}
