import { Component, ChangeDetectionStrategy } from '@angular/core';

import { of, combineLatest, Subject, BehaviorSubject } from 'rxjs';
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
  error$ = new Subject<string>();

  // Action stream
  private selectCategoryAction = new BehaviorSubject<number>(0);

  // Merge Data stream with Action stream
  // To filter to the selected category
  products$ = combineLatest(
    this.productService.productsWithAdd$,
    this.selectCategoryAction
  )
    .pipe(
      map(([products, categoryId]) =>
        products.filter(product =>
          categoryId ? product.categoryId === categoryId : true)
      ),
      catchError(err => {
        this.error$.next(err);
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

  onSelected(categoryId: string): void {
    this.selectCategoryAction.next(+categoryId);
  }

  onAdd() {
    this.productService.addProduct();
  }
}
