import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderDetail } from '../class/order-detail';

@Injectable({
  providedIn: 'root'
})
export class OrderDetailService {
  private orderDetailAPI = 'http://localhost:8080/api/order-details';

  constructor(private httpClient: HttpClient) { }

  getOrderDetailByOrderId(orderId: number): Observable<OrderDetail[]> {
    return this.httpClient.get<OrderDetail[]>(this.orderDetailAPI + '/' + orderId);
  }

  createOrderDetail(orderDetail: OrderDetail): Observable<OrderDetail> {
    return this.httpClient.post<OrderDetail>(this.orderDetailAPI, orderDetail);
  }

  getOrderDetailById(id: number): Observable<OrderDetail> {
    return this.httpClient.get<OrderDetail>(this.orderDetailAPI + '/details/' + id);
  }

  updateOrderDetail(orderDetail: OrderDetail): Observable<OrderDetail> {
    return this.httpClient.put<OrderDetail>(this.orderDetailAPI + '/details/' + orderDetail.id, orderDetail);
  }

  deleteOrderDetail(id: number): Observable<void> {
    return this.httpClient.delete<void>(this.orderDetailAPI + '/details/' + id);
  }

}
