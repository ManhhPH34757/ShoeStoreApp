import { Order } from "./order";
import { ProductDetail } from "./product-detail";

export class OrderDetail {
  public id!: number;
  public idProductDetails!: ProductDetail;
  public idOrders!: Order;
  public quantity!: number;
  public totalPrice!: number;
  public status!: string;
}
