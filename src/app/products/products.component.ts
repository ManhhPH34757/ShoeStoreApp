import {
  Component,
  ViewChild,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  ElementRef,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ProductService } from '../service/product.service';
import { BrandService } from '../service/brand.service';
import { CategoryService } from '../service/category.service';
import { MaterialService } from '../service/material.service';
import { SoleService } from '../service/sole.service';
import { Product } from '../class/product';
import { Brand } from '../class/brand';
import { Category } from '../class/category';
import { Material } from '../class/material';
import { Sole } from '../class/sole';
import { Observable, forkJoin } from 'rxjs';
import { ProductDto } from '../class/product-dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit, AfterViewInit {
  products$: Observable<ProductDto[]> = this.productService.getProducts();
  brands$: Observable<Brand[]> = this.brandService.getBrands();
  categories$: Observable<Category[]> = this.categoryService.getCategories();
  materials$: Observable<Material[]> = this.materialService.getMaterials();
  soles$: Observable<Sole[]> = this.soleService.getSoles();

  dataSource = new MatTableDataSource<ProductDto>();

  displayedColumns: string[] = [
    'index',
    'product_name',
    'brand_name',
    'category_name',
    'material_name',
    'sole_name',
    'quantity',
    'action',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('productFormElement') productFormElement!: ElementRef;

  productForm!: FormGroup;
  filterForm!: FormGroup;
  selectedProduct: Product | null = null;
  isEditMode = false;
  filterValues: any = {
    productName: '',
    brandName: '',
    categoryName: '',
    materialName: '',
    soleName: ''
  };

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private materialService: MaterialService,
    private soleService: SoleService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadProducts();
    this.initForm();
    this.dataSource.filterPredicate = this.createFilter();
  }

  loadProducts(): void {
    this.products$.subscribe((data) => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cdr.detectChanges();
  }

  getIndex(index: number): number {
    return (
      this.paginator?.pageIndex * this.paginator?.pageSize + index + 1 || 0
    );
  }

  initForm(): void {
    this.productForm = this.formBuilder.group({
      productCode: ['', Validators.required],
      productName: ['', Validators.required],
      idBrand: [null, Validators.required],
      idCategory: [null, Validators.required],
      idSole: [null, Validators.required],
      idMaterial: [null, Validators.required],
      weight: ['', Validators.required],
      dateCreated: [{ value: new Date(), disabled: true }],
      dateUpdated: [{ value: new Date(), disabled: true }],
    });

    this.filterForm = this.formBuilder.group({
      productName: [''],
      brandName: [null],
      categoryName: [null],
      materialName: [null],
      soleName: [null]
    });
  }

  onEditProduct(productDto: ProductDto): void {
    const product: Product = new Product();
    this.productService.getProduct(productDto.id).subscribe((data: Product) => {
      Object.assign(product, data);

      this.selectedProduct = product;
      this.productForm.setValue({
        productCode: product.productCode,
        productName: product.productName,
        idBrand: product.idBrand.id,
        idCategory: product.idCategory.id,
        idSole: product.idSole.id,
        idMaterial: product.idMaterial.id,
        weight: product.weight,
        dateCreated: product.dateCreated,
        dateUpdated: product.dateUpdated,
      });
    });
    this.scrollToForm();
    this.isEditMode = true;
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const product: Product = {
        id: 0,
        dateCreated: new Date(),
        ...this.selectedProduct,
        productCode: this.productForm.get('productCode')?.value,
        productName: this.productForm.get('productName')?.value,
        weight: this.productForm.get('weight')?.value,
        idBrand: new Brand(),
        idCategory: new Category(),
        idSole: new Sole(),
        idMaterial: new Material(),
        dateUpdated: new Date(),
      };

      forkJoin({
        brand: this.brandService.getBrand(this.productForm.get('idBrand')?.value),
        category: this.categoryService.getCategory(this.productForm.get('idCategory')?.value),
        sole: this.soleService.getSole(this.productForm.get('idSole')?.value),
        material: this.materialService.getMaterial(this.productForm.get('idMaterial')?.value)
      }).subscribe({
        next: ({ brand, category, sole, material }) => {
          product.idBrand = brand;
          product.idCategory = category;
          product.idSole = sole;
          product.idMaterial = material;

          if (this.selectedProduct && this.selectedProduct.id) {
            this.productService.updateProduct(product).subscribe(() => {
              this.loadProducts();
              this.resetForm();
            });
          } else {
            this.productService.addProduct(product).subscribe(() => {
              this.loadProducts();
              this.resetForm();
            });
          }
        },
        error: (error) => {
          console.error('Error fetching dependencies', error);
        }
      });
    }
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedProduct = null;
    this.productForm = this.formBuilder.group({
      productCode: ['', Validators.required],
      productName: ['', Validators.required],
      idBrand: [null, Validators.required],
      idCategory: [null, Validators.required],
      idSole: [null, Validators.required],
      idMaterial: [null, Validators.required],
      dateCreated: [{ value: new Date(), disabled: true }],
      dateUpdated: [{ value: new Date(), disabled: true }],
    });
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.setErrors(null);
    });
  }

  deleteProduct(id: number): void {
    this.productService.deleteProduct(id).subscribe(() => {
      this.loadProducts();
    });
  }

  scrollToForm(): void {
    if (this.productFormElement && this.productFormElement.nativeElement) {
      this.productFormElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.dataSource.filter = '';
    this.filterValues = {
      productName: '',
      brandName: '',
      categoryName: '',
      materialName: '',
      soleName: ''
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

  createFilter(): (data: ProductDto, filter: string) => boolean {
    return (data: ProductDto, filter: string): boolean => {
      let searchString = JSON.parse(filter);
      return data.product_name.toLowerCase().includes(searchString.productName) &&
        data.brand_name.toLowerCase().includes(searchString.brandName) &&
        data.category_name.toLowerCase().includes(searchString.categoryName) &&
        data.material_name.toLowerCase().includes(searchString.materialName) &&
        data.sole_name.toLowerCase().includes(searchString.soleName);
    };
  }

  importProduct() {

  }

  exportProduct() {

  }


}
