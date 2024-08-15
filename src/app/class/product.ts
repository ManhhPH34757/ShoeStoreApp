import { Brand } from './brand';
import { Category } from './category';
import { Material } from './material';
import { Sole } from './sole';

export class Product {
  public id: number = 0;
  public productCode: string = '';
  public productName: string = '';
  public idBrand: Brand = new Brand();
  public idCategory: Category = new Category();
  public idSole: Sole = new Sole();
  public idMaterial: Material = new Material();
  public dateCreated: Date = new Date();
  public dateUpdated: Date = new Date();
  public weight: number = 0;
}
