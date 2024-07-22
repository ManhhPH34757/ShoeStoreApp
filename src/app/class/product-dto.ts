export class ProductDto {
  public id: number = 0;
  public product_code: string = '';
  public product_name: string = '';
  public brand_name: string = '';
  public category_name: string = '';
  public sole_name: string = '';
  public material_name: string = '';
  public date_created: Date = new Date();
  public date_updated: Date = new Date();
  public quantity: number = 0;
}
