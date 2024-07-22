import { Admin } from "./admin";
import { Coupon } from "./coupon";
import { Customer } from "./customer";
import { Pay } from "./pay";

export class Order {
  public id!: number;
  public orderCode!: string;
  public idCustomer!: Customer | null;
  public idAdmin!: Admin;
  public idCoupons!: Coupon;
  public idPay!: Pay;
  public customerName!: string;
  public phoneNumber!: string;
  public address!: string;
  public transportPrice!: number;
  public reducedPrice!: number;
  public exchangePrice!: number;
  public totalPrice!: number;
  public totalPayouts!: number;
  public status!: string;
  public dateCreated!: Date;
  public dateUpdated!: Date;
  public orderType !: string;

}
