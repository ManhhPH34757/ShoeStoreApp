import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../class/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private orderAPI: string = 'http://localhost:8080/api/orders';

  constructor(private httpClient: HttpClient) { }

  newOrderOffline(order: Order): Observable<Order> {
    return this.httpClient.post<Order>(this.orderAPI, order);
  }

  getOrdersWaitForPay(): Observable<Order[]> {
    return this.httpClient.get<Order[]>(this.orderAPI + '/wait-for-pay');
  }

  deleteOrder(id: number): Observable<void> {
    return this.httpClient.delete<void>(this.orderAPI + '/' + id);
  }

  getOrderById(id: number): Observable<Order> {
    return this.httpClient.get<Order>(this.orderAPI + '/' + id);
  }

  updateOrder(order: Order): Observable<Order> {
    return this.httpClient.put<Order>(this.orderAPI + '/' + order.id, order);
  }
}
