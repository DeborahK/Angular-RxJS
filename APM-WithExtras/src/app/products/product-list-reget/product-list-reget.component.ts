import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, EMPTY, map, Subject } from 'rxjs';
import { ProductCategoryService } from 'src/app/product-categories/product-category.service';
import { Product } from '../product';
import { ProductRegetService } from './product-reget.service';

@Component({
  selector: 'pm-product-list-reget',
  templateUrl: './product-list-reget.component.html',
  styleUrls: ['./product-list-reget.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListRegetComponent {
  pageTitle = 'Product List (Edit with Re-get)';
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  products$ = combineLatest([
    this.productRegetService.productsWithCRUD$,
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

  constructor(private productRegetService: ProductRegetService,
    private productCategoryService: ProductCategoryService
    ) { }

  onAdd(): void {
    this.productRegetService.addProduct();
  }

  onDelete(product: Product): void {
    this.productRegetService.deleteProduct(product);
  }
  
  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }

  onUpdate(product: Product): void {
    this.productRegetService.updateProduct(product);
  }
}
