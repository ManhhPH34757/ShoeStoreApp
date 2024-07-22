import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductDetail } from '../class/product-detail';

@Injectable({
  providedIn: 'root'
})
export class ProductDetailService {

  private productDetailAPI = 'http://localhost:8080/api/product-details';

  constructor(private httpClient: HttpClient) { }

  getAllProductDetails(): Observable<ProductDetail[]> {
    return this.httpClient.get<ProductDetail[]>(this.productDetailAPI);
  }

  getproductDetailById(id: number): Observable<ProductDetail> {
    return this.httpClient.get<ProductDetail>(this.productDetailAPI + '/' + id);
  }

  updateProductDetails(productDetail: ProductDetail): Observable<ProductDetail> {
    return this.httpClient.put<ProductDetail>(this.productDetailAPI + '/' + productDetail.id, productDetail);
  }
  
}
