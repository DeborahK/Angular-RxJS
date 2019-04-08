import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ProductService } from './product.service';
import { interval, Observable, of, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { catchError, mergeMap, pluck, tap, distinct, toArray, filter, map, startWith, shareReplay } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';

  private selectedCategorySource = new Subject();
  selectedCategoryChanges$ = this.selectedCategorySource.asObservable();

  // Or withLatestFrom
  products$ = combineLatest(
    this.productService.productsWithAdd$,
    this.selectedCategoryChanges$.pipe(startWith(null))
  )
    .pipe(
      map(([products, category]) => products.filter(product => category ? product.category === category : true)),
      catchError(err => {
        this.errorMessage = err;
        return of(null);
      })
    );

  // Categories for drop down list
  categories$ = this.productCategoryService.categoryNames$;

  /*
    Code from prior examples
  */
  productsJustProducts$ = this.productService.products$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return of(null);
      })
    );

  // Filter to defined category
  selectedCategory = 'Garden';
  productsSimpleFilter$ = this.productService.productsWithCategory$
    .pipe(
      mergeMap(products => products),
      filter(product => product.category === this.selectedCategory),
      toArray(),
      catchError(err => {
        this.errorMessage = err;
        return of(null);
      })
    );

  constructor(private productService: ProductService,
    private productCategoryService: ProductCategoryService) { }

  onSelected(category: string): void {
    this.selectedCategorySource.next(category);
  }

  onAdd() {
    this.productService.addOne();
  }
}
