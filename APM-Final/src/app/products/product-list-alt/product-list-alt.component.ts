import { Component, ChangeDetectionStrategy } from '@angular/core';

import { of, Subject, combineLatest } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ProductService } from '../product.service';
import { Product } from '../product';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  error$ = new Subject<string>();

  // Products with their categories
  products$ = this.productService.productsWithCategory$.pipe(
    catchError(err => {
      this.error$.next(err);
      return of(null);
    }));

  // Selected product to highlight the entry
  selectedProduct$ = this.productService.selectedProduct$;

  // Combine all streams for the view
  vm$ = combineLatest([
    this.products$,
    this.selectedProduct$
  ])
    .pipe(
      map(([products, product]: [Product[], Product]) =>
        ({ products, productId: product ? product.id : 0 }))
    );

  constructor(
    private productService: ProductService
  ) { }

  onSelected(productId: number): void {
    this.productService.changeSelectedProduct(productId);
  }
}
