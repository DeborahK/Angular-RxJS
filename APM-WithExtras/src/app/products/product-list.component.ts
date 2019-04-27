import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ProductService } from './product.service';
import { of, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { catchError, mergeMap, pluck, tap, distinct, toArray, filter, map, startWith, shareReplay, mergeAll } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';

  private selectCategoryAction = new BehaviorSubject<number>(0);

  // Or withLatestFrom
  products$ = combineLatest(
    this.productService.productsWithAdd$,
    this.selectCategoryAction
  )
    .pipe(
      tap(console.log),
      map(([products, categoryId]) =>
        products.filter(product =>
          categoryId ? product.categoryId === categoryId : true)
      ),
      catchError(err => {
        this.errorMessage = err;
        return of(null);
      })
    );

  // Categories for drop down list
  categories$ = this.productCategoryService.productCategories$;

  /*
    Code from prior examples
  */
  // productsJustProducts$ = this.productService.products$
  //   .pipe(
  //     catchError(err => {
  //       this.errorMessage = err;
  //       return of(null);
  //     })
  //   );

  // Filter to defined category
  // selectedCategoryId = 1;
  // productsSimpleFilter2$ = this.productService.productsWithCategory$
  //   .pipe(
  //     mergeAll(),
  //     filter(product => product.categoryId === this.selectedCategoryId),
  //     toArray(),
  //     catchError(err => {
  //       this.errorMessage = err;
  //       return of(null);
  //     })
  //   );

  // productsSimpleFilter$ = this.productService.productsWithCategory$
  //   .pipe(
  //     map(products =>
  //       products.filter(product => product.categoryId === this.selectedCategoryId)
  //     )
  //   );

  constructor(private productService: ProductService,
    private productCategoryService: ProductCategoryService) { }

  onSelected(categoryId): void {
    this.selectCategoryAction.next(+categoryId);
  }

  onAdd() {
    this.productService.addOne();
  }
}
