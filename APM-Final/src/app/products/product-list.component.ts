import { Component, ChangeDetectionStrategy } from '@angular/core';

import { of, combineLatest, BehaviorSubject } from 'rxjs';
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
  errorMessage = '';

  // Action stream
  private categorySelectedAction$ = new BehaviorSubject<number>(0);

  // Merge Data stream with Action stream
  // To filter to the selected category
  products$ = combineLatest([
    this.productService.productsWithAdd$,
    this.categorySelectedAction$
  ])
    .pipe(
      map(([products, selectedCategoryId]) =>
        products.filter(product =>
          selectedCategoryId ?
            product.categoryId === selectedCategoryId :
            true
        )),
      catchError(err => {
        this.errorMessage = err;
        return of(null);
      })
    );

  // Categories for drop down list
  categories$ = this.productCategoryService.productCategories$;

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
    this.categorySelectedAction$.next(+categoryId);
  }

}
