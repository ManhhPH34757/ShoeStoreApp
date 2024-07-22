import { Color } from "./color";
import { Product } from "./product";
import { Sale } from "./sale";
import { Sizes } from "./sizes";

export class ProductDetail {
  public id!: number;
  public idProduct!: Product;
  public idColor!: Color;
  public idSize!: Sizes;
  public idSale!: Sale;
  public priceOld!: number;
  public priceNew!: number;
  public quantity!: number;
  public status!: string;
  public dateCreated!: Date;
  public dateUpdated!: Date;
}
