import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Order } from '../class/order';
import { OrderService } from '../service/order.service';
import { Observable, Subject, of } from 'rxjs';
import {
  map,
  debounceTime,
  switchMap,
  catchError,
  startWith,
} from 'rxjs/operators';
import { OrderDetailService } from '../service/order-detail.service';
import { OrderDetail } from '../class/order-detail';
import { ProductDetail } from '../class/product-detail';
import { ProductDetailService } from '../service/product-detail.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BrandService } from '../service/brand.service';
import { CategoryService } from '../service/category.service';
import { MaterialService } from '../service/material.service';
import { SoleService } from '../service/sole.service';
import { Brand } from '../class/brand';
import { Category } from '../class/category';
import { Material } from '../class/material';
import { Sole } from '../class/sole';
import { ColorService } from '../service/color.service';
import { SizeService } from '../service/size.service';
import { Color } from '../class/color';
import { Sizes } from '../class/sizes';
import { CustomerService } from '../service/customer.service';
import { Customer } from '../class/customer';
import { AddressService } from '../service/address.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit, AfterViewInit {
  orders: Order[] = [];
  activeTab: number = 0;
  orderCode: string = '';
  order: Order = new Order();
  orders$: Observable<Order[]>;
  orderSelect: Order = new Order();
  orderDetails: OrderDetail[] = [];
  orderDetail: OrderDetail = new OrderDetail();
  productDetails: ProductDetail[] = [];
  customers: Customer[] = [];

  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];

  brands$: Observable<Brand[]> = this.brandService.getBrands();
  categories$: Observable<Category[]> = this.categoryService.getCategories();
  materials$: Observable<Material[]> = this.materialService.getMaterials();
  soles$: Observable<Sole[]> = this.soleService.getSoles();
  colors$: Observable<Color[]> = this.colorService.getColors();
  sizes$: Observable<Sizes[]> = this.sizeService.getSizes();

  dataSource = new MatTableDataSource<ProductDetail>();
  displayedColumns: string[] = [
    'index',
    'productName',
    'price',
    'quantity',
    'action',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterForm!: FormGroup;
  filterValues: any = {
    productName: '',
    brand: '',
    category: '',
    material: '',
    sole: '',
    color: '',
    size: '',
  };

  myControl = new FormControl();
  filteredOptions = this.customerService.getCustomers();

  private qtyChangeSubject = new Subject<{
    idOrderDetail: number;
    idProductDetail: number;
    qty: number;
  }>();
  check: boolean = true;

  checkFullName: boolean = true;
  checkPhoneNumber: boolean = true;
  checkCity: boolean = true;
  checkDistrict: boolean = true;
  checkWard: boolean = true;
  checkSpecificLocation: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private orderService: OrderService,
    private orderDetailService: OrderDetailService,
    private productDetailService: ProductDetailService,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private materialService: MaterialService,
    private soleService: SoleService,
    private colorService: ColorService,
    private sizeService: SizeService,
    private customerService: CustomerService,
    private addressService: AddressService,
    private cdr: ChangeDetectorRef
  ) {
    this.orders$ = this.orderService.getOrdersWaitForPay();
    this.orderService.getOrdersWaitForPay().subscribe((data) => {
      if (data != null) {
        this.orders = data;
        this.orderSelect = this.orders[0];
        if (this.orderSelect != null) {
          this.orderDetailService
            .getOrderDetailByOrderId(this.orderSelect.id)
            .subscribe((data) => {
              this.orderDetails = data;
            });
        }
      }
    });

    this.productDetailService.getAllProductDetails().subscribe((data) => {
      this.productDetails = data;
      this.dataSource.sort = this.sort;
      this.dataSource.data = this.productDetails; // Gán dữ liệu cho dataSource tại đây
    });
    this.initForm();
    this.loadProvinces();
  }

  ngOnInit(): void {
    this.loadProvinces();
    this.loadProducts();
    this.initForm();
    this.dataSource.filterPredicate = this.createFilter();

    this.qtyChangeSubject
      .pipe(
        debounceTime(1000),
        switchMap(({ idOrderDetail, idProductDetail, qty }) => {
          return this.changeQty(idOrderDetail, idProductDetail, qty);
        })
      )
      .subscribe();

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) =>
        this.customerService
          .getCustomers()
          .pipe(map((customers) => this._filter(customers, value)))
      )
    );
  }

  private _filter(customers: Customer[], value: string): Customer[] {
    const filterValue = value.toLowerCase();
    return customers.filter((option) =>
      option.phoneNumber.toLowerCase().includes(filterValue)
    );
  }

  loadProvinces(): void {
    this.addressService.getProvinces().subscribe((data) => {
      this.provinces = data.results;
    });
  }

  onProvinceChange(event: any): void {
    const provinceId = event.target.value;
    if (provinceId) {
      this.addressService.getDistricts(provinceId).subscribe((data) => {
        this.districts = data.results;
        this.wards = []; // Clear wards when province changes
      });
    } else {
      this.districts = [];
      this.wards = [];
    }
  }

  onDistrictChange(event: any): void {
    const districtId = event.target.value;
    if (districtId) {
      this.addressService.getWards(districtId).subscribe((data) => {
        this.wards = data.results;
      });
    } else {
      this.wards = [];
    }
  }

  clearInput() {
    this.myControl.setValue('');
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cdr.detectChanges();
  }

  initForm(): void {
    this.filterForm = this.formBuilder.group({
      productName: [''],
      brand: [null],
      category: [null],
      material: [null],
      sole: [null],
      color: [null],
      size: [null],
    });
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.dataSource.filter = '';
    this.filterValues = {
      productName: '',
      brand: '',
      category: '',
      material: '',
      sole: '',
      color: '',
      size: '',
    };
  }

  filterChange(filter: string, event: Event | string) {
    if (typeof event === 'string') {
      this.filterValues[filter] = event.trim().toLowerCase();
    } else {
      const inputElement = event.target as HTMLInputElement;
      if (inputElement) {
        this.filterValues[filter] = inputElement.value.trim().toLowerCase();
      }
    }
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }

  createFilter(): (data: ProductDetail, filter: string) => boolean {
    return (data: ProductDetail, filter: string): boolean => {
      let searchString = JSON.parse(filter);
      return (
        data.idProduct.productName
          .toLowerCase()
          .includes(searchString.productName) &&
        data.idProduct.idBrand.brandName
          .toLowerCase()
          .includes(searchString.brand) &&
        data.idProduct.idCategory.categoryName
          .toLowerCase()
          .includes(searchString.category) &&
        data.idProduct.idMaterial.materialName
          .toLowerCase()
          .includes(searchString.material) &&
        data.idProduct.idSole.soleName
          .toLowerCase()
          .includes(searchString.sole) &&
        data.idColor.colorName.toLowerCase().includes(searchString.color) &&
        data.idSize.sizeName.toLowerCase().includes(searchString.size)
      );
    };
  }

  loadProducts(): void {
    this.productDetailService.getAllProductDetails().subscribe((data) => {
      this.productDetails = data;
      this.dataSource.sort = this.sort;
      this.dataSource.data = this.productDetails; // Gán dữ liệu cho dataSource tại đây
    });
  }

  createOrder(): void {
    this.orders$ = this.orderService.getOrdersWaitForPay();
    this.orders$.pipe(map((orders) => orders.length)).subscribe((size) => {
      if (size < 4) {
        this.orderCode = this.generateInvoiceCode();
        this.order.orderCode = this.orderCode;
        this.order.status = 'WAIT FOR PAY';
        this.order.dateCreated = new Date();
        this.order.orderType = 'Transaction at the counter';
        this.order.transportPrice = 0;
        this.order.reducedPrice = 0;
        this.order.totalPrice = 0;
        this.order.totalPayouts = 0;
        this.orderService.newOrderOffline(this.order).subscribe(() => {
          this.orderService.getOrdersWaitForPay().subscribe((data) => {
            this.orders = data;
            this.orderSelect = this.orders[0];
            this.orderDetailService
              .getOrderDetailByOrderId(this.orderSelect.id)
              .subscribe((data) => {
                this.orderDetails = data;
              });
          });
        });
      } else {
        alert(
          'You have reached the maximum number of orders. Please delete some orders before creating a new order.'
        );
      }
    });
  }

  selectTab(i: number) {
    this.activeTab = i;
    this.orderSelect = this.orders[i];
    this.orderDetailService
      .getOrderDetailByOrderId(this.orderSelect.id)
      .subscribe((data) => {
        this.orderDetails = data;
      });
  }

  deleteTab(id: number) {
    const check: boolean = confirm('Do you want to delete this order?');
    if (check) {
      this.orderService.deleteOrder(id).subscribe(() => {
        this.orderService.getOrdersWaitForPay().subscribe((data) => {
          this.orders = data;
          this.orderSelect = this.orders[0];
          this.orderDetailService
            .getOrderDetailByOrderId(this.orderSelect.id)
            .subscribe((data) => {
              this.orderDetails = data;
            });
        });
      });
    }
  }

  generateInvoiceCode(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    return `INV${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
  }

  getIndex(index: number): number {
    return (
      this.paginator?.pageIndex * this.paginator?.pageSize + index + 1 || 0
    );
  }

  selectProduct(id: number): void {
    this.orderDetailService
      .getOrderDetailByOrderId(this.orderSelect.id)
      .subscribe((data) => {
        data.forEach((element) => {
          if (element.idProductDetails.id === id) {
            this.check = false;
          }
        });
        if (this.check) {
          this.orderService
            .getOrderById(this.orderSelect.id)
            .subscribe((data) => {
              this.orderDetail.idOrders = data;
              this.productDetailService
                .getproductDetailById(id)
                .subscribe((data) => {
                  this.orderDetail.idProductDetails = data;
                  this.orderDetail.quantity = 1;
                  this.orderDetail.totalPrice =
                    this.orderDetail.quantity * data.priceNew;
                  this.orderDetailService
                    .createOrderDetail(this.orderDetail)
                    .subscribe(() => {
                      this.orderDetailService
                        .getOrderDetailByOrderId(this.orderSelect.id)
                        .subscribe((data) => {
                          this.orderDetails = data;
                          this.productDetailService
                            .getproductDetailById(id)
                            .subscribe((data) => {
                              const productDetailUpdate = data;
                              productDetailUpdate.quantity =
                                productDetailUpdate.quantity - 1;
                              this.productDetailService
                                .updateProductDetails(productDetailUpdate)
                                .subscribe(() => {
                                  this.loadProducts();
                                  this.productDetailService
                                    .getproductDetailById(id)
                                    .subscribe((data) => {
                                      const productDetail: ProductDetail = data;
                                      this.orderService
                                        .getOrderById(this.orderSelect.id)
                                        .subscribe((data) => {
                                          const order: Order = data;
                                          order.totalPrice +=
                                            productDetail.priceNew;
                                          order.totalPayouts =
                                            order.totalPrice -
                                            order.reducedPrice +
                                            order.transportPrice;
                                          this.orderService
                                            .updateOrder(order)
                                            .subscribe(() => {
                                              this.orderService
                                                .getOrdersWaitForPay()
                                                .subscribe((data) => {
                                                  this.orders = data;
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        } else {
          alert('Product is present in this order');
          this.check = true;
        }
      });
  }

  onQtyChange(idOrderDetail: number, idProductDetail: number, qty: number) {
    this.qtyChangeSubject.next({ idOrderDetail, idProductDetail, qty });
  }

  changeQty(idOrderDetail: number, idProductDetail: number, qty: number) {
    if (qty == null || qty <= 0) {
      qty = 1;
    }

    return this.productDetailService.getproductDetailById(idProductDetail).pipe(
      switchMap((productDetail: ProductDetail) =>
        this.orderDetailService.getOrderDetailById(idOrderDetail).pipe(
          switchMap((orderDetail: OrderDetail) => {
            if (productDetail.quantity + orderDetail.quantity >= qty) {
              const qtyOld = orderDetail.quantity;
              orderDetail.quantity = qty;
              orderDetail.totalPrice = qty * productDetail.priceNew;

              return this.orderDetailService
                .updateOrderDetail(orderDetail)
                .pipe(
                  switchMap(() => {
                    productDetail.quantity =
                      productDetail.quantity + qtyOld - qty;
                    return this.productDetailService
                      .updateProductDetails(productDetail)
                      .pipe(
                        switchMap(() =>
                          this.orderDetailService
                            .getOrderDetailByOrderId(orderDetail.idOrders.id)
                            .pipe(
                              map((orderDetail: OrderDetail[]) => {
                                this.orderDetails = orderDetail;
                                this.orderService
                                  .getOrderById(orderDetail[0].idOrders.id)
                                  .subscribe((data) => {
                                    const order: Order = data;
                                    let total: number = 0;
                                    this.orderDetails.forEach((element) => {
                                      total += element.totalPrice;
                                    });
                                    order.totalPrice = total;
                                    order.totalPayouts =
                                      order.totalPrice -
                                      order.reducedPrice +
                                      order.transportPrice;
                                    this.orderService
                                      .updateOrder(order)
                                      .subscribe(() => {
                                        this.orderService
                                          .getOrdersWaitForPay()
                                          .subscribe((data) => {
                                            this.orders = data;
                                          });
                                      });
                                  });
                              })
                            )
                        ),
                        catchError((error) => {
                          console.error(
                            'Error updating product details',
                            error
                          );
                          return of([]);
                        })
                      );
                  }),
                  catchError((error) => {
                    console.error('Error updating order detail', error);
                    return of(null);
                  })
                );
            } else {
              alert('Quantity is not available');
              return of(null);
            }
          }),
          catchError((error) => {
            console.error('Error getting order detail', error);
            return of(null);
          })
        )
      ),
      catchError((error) => {
        console.error('Error getting product detail', error);
        return of(null);
      })
    );
  }

  removeProduct(id: number, idProductDetail: number): void {
    const check: boolean = confirm(
      'Do you want remove this product in this order?'
    );
    if (check) {
      this.orderDetailService.getOrderDetailById(id).subscribe((data) => {
        const orderDetail: OrderDetail = data;
        const idOrder: number = orderDetail.idOrders.id;
        this.productDetailService
          .getproductDetailById(idProductDetail)
          .subscribe((data) => {
            const productDetail: ProductDetail = data;
            productDetail.quantity =
              productDetail.quantity + orderDetail.quantity;
            this.productDetailService
              .updateProductDetails(productDetail)
              .subscribe(() => {
                this.orderDetailService.deleteOrderDetail(id).subscribe(() => {
                  this.orderDetailService
                    .getOrderDetailByOrderId(idOrder)
                    .subscribe((data) => {
                      this.orderDetails = data;
                      this.orderService
                        .getOrderById(data[0].idOrders.id)
                        .subscribe((data) => {
                          const order: Order = data;
                          let total: number = 0;
                          this.orderDetails.forEach((element) => {
                            total += element.totalPrice;
                          });
                          order.totalPrice = total;
                          order.totalPayouts =
                            order.totalPrice -
                            order.reducedPrice +
                            order.transportPrice;
                          this.orderService.updateOrder(order).subscribe(() => {
                            this.orderService
                              .getOrdersWaitForPay()
                              .subscribe((data) => {
                                this.orders = data;
                              });
                          });
                        });
                    });
                });
              });
          });
      });
    }
  }

  changeOrderType(index: number, order: Order) {
    const ckbox = document.getElementById(
      'switch-' + index
    ) as HTMLInputElement;
    if (ckbox.checked) {
      order.orderType = 'Delivery';
    } else {
      order.orderType = 'Transaction at the counter';
    }

    this.orderService.updateOrder(order).subscribe(() => {
      this.orderService.getOrdersWaitForPay().subscribe((data) => {
        this.orders = data;
      });
    });
  }

  removeCustomer(order: Order) {
    const check = confirm('Do you want remove this customer?');
    if (check) {
      order.idCustomer = null;
      this.orderService.updateOrder(order).subscribe(() => {
        this.orderService.getOrdersWaitForPay().subscribe((data) => {
          this.orders = data;
        });
      });
    }
  }

  selectCustomer(i: number) {
    const selectCustomer = document.getElementById(
      'customer-' + i
    ) as HTMLInputElement;
    if (selectCustomer.value == '') {
      alert('Please, Enter the phone number!');
    } else {
      this.customerService
        .getCustomerByPhoneNumber(selectCustomer.value)
        .subscribe((data) => {
          const customer: Customer = data;
          this.orderService
            .getOrderById(this.orders[i].id)
            .subscribe((data) => {
              const order: Order = data;
              order.idCustomer = customer;
              this.orderService.updateOrder(order).subscribe(() => {
                this.orderService.getOrdersWaitForPay().subscribe((data) => {
                  this.orders = data;
                  this.myControl.setValue('');
                });
              });
            });
        });
    }
  }

  saveCustomerAddress(order: Order, index: number) {
    const fullName = document.getElementById(
      'fullname-' + index
    ) as HTMLInputElement;
    const phoneNumber = document.getElementById(
      'phonenumber-' + index
    ) as HTMLInputElement;
    const city = document.getElementById('city-' + index) as HTMLSelectElement;
    const districtV = document.getElementById(
      'district-' + index
    ) as HTMLSelectElement;
    const wardV = document.getElementById('ward-' + index) as HTMLSelectElement;
    const specificLocation = document.getElementById(
      'specific-location-' + index
    ) as HTMLInputElement;

    if (fullName.value == '') {
      this.checkFullName = false;
    } else {
      this.checkFullName = true;
    }

    if (phoneNumber.value == '') {
      this.checkPhoneNumber = false;
    } else {
      this.checkPhoneNumber = true;
    }

    if (city.value == '') {
      this.checkCity = false;
    } else {
      this.checkCity = true;
    }

    if (districtV.value == '') {
      this.checkDistrict = false;
    } else {
      this.checkDistrict = true;
    }

    if (wardV.value == '') {
      this.checkWard = false;
    } else {
      this.checkWard = true;
    }

    if (specificLocation.value == '') {
      this.checkSpecificLocation = false;
    } else {
      this.checkSpecificLocation = true;
    }

    if (
      this.checkFullName &&
      this.checkPhoneNumber &&
      this.checkCity &&
      this.checkDistrict &&
      this.checkWard &&
      this.checkSpecificLocation
    ) {
      order.customerName = fullName.value;
      order.phoneNumber = phoneNumber.value;
      const province = this.provinces.find(
        (province) => province.province_id == city.value
      );
      const district = this.districts.find(
        (district) => district.district_id == districtV.value
      );
      const ward = this.wards.find((ward) => ward.ward_id == wardV.value);
      order.address = `${province.province_name} - ${district.district_name} - ${ward.ward_name} - ${specificLocation.value}`;
      order.transportPrice = 5;
      order.totalPayouts = order.totalPayouts + 5;
      this.orderService.updateOrder(order).subscribe(() => {
        this.orderService.getOrdersWaitForPay().subscribe((data) => {
          this.orders = data;
          this.orderSelect = order;
        });
      });
    }
  }

  submitOrder(order: Order) {
    if (order.orderType == 'Transaction at the counter') {
      order.status = 'Success Pay';
    } else {
      if (
        this.checkFullName &&
        this.checkPhoneNumber &&
        this.checkCity &&
        this.checkDistrict &&
        this.checkWard &&
        this.checkSpecificLocation
      ) {
        order.status = 'Success Pay';
      }
    }
    this.orderService.updateOrder(order).subscribe(() => {
      this.orderService.getOrdersWaitForPay().subscribe((data) => {
        this.orders = data;
        this.orderSelect = this.orders[0];
      });
    });
  }
}
