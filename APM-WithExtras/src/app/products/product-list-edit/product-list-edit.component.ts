import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, EMPTY, map, Subject } from 'rxjs';
import { ProductCategoryService } from 'src/app/product-categories/product-category.service';
import { Product } from '../product';
import { ProductEditService } from './product-edit.service';

@Component({
  templateUrl: './product-list-edit.component.html',
  styleUrls: ['./product-list-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListEditComponent {
  pageTitle = 'Product List (Edit)';
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  products$ = combineLatest([
    this.productEditService.productsWithCRUD$,
    this.categorySelectedAction$
  ])
    .pipe(
      map(([products, selectedCategoryId]) =>
        products.filter(product =>
          selectedCategoryId ? product.categoryId === selectedCategoryId : true
        )),
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    );

  categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    );

  vm$ = combineLatest([
    this.products$,
    this.categories$
  ])
    .pipe(
      map(([products, categories]) =>
        ({ products, categories }))
    );

  constructor(private productEditService: ProductEditService,
    private productCategoryService: ProductCategoryService
    ) { }

  onAdd(): void {
    this.productEditService.addProduct();
  }

  onDelete(product: Product): void {
    this.productEditService.deleteProduct(product);
  }
  
  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }

  onUpdate(product: Product): void {
    this.productEditService.updateProduct(product);
  }
}
