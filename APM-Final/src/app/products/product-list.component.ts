import { Component, ChangeDetectionStrategy } from '@angular/core';

import { combineLatest, BehaviorSubject, EMPTY, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ProductService } from './product.service';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  // Action stream
  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  // Merge Data stream with Action stream
  // To filter to the selected category
  products$ = combineLatest([
    this.productService.productsWithAdd$,
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

  // Categories for drop down list
  categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    );

  // Combine all streams for the view
  vm$ = combineLatest([
    this.products$,
    this.categories$
  ])
    .pipe(
      map(([products, categories]) =>
        ({ products, categories }))
    );

  constructor(private productService: ProductService,
              private productCategoryService: ProductCategoryService) { }

  onAdd(): void {
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }

}
