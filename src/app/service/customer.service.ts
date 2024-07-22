import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Customer } from '../class/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private customerAPI = 'http://localhost:8080/api/customers';

  constructor(private httpClient: HttpClient) { }

  getCustomers(): Observable<Customer[]> {
    return this.httpClient.get<Customer[]>(this.customerAPI);
  }

  getCustomerByPhoneNumber(phoneNumber: string): Observable<Customer> {
    return this.httpClient.get<Customer>(this.customerAPI + '/' + phoneNumber);
  }

}
