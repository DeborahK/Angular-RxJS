import { Component, ChangeDetectionStrategy } from '@angular/core';

import { combineLatest, Subject, EMPTY } from 'rxjs';
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
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  // Products with their categories
  // Using productsWithAdd here to pick up
  // any newly added products
  products$ = this.productService.productsWithAdd$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
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

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.selectedProductChanged(productId);
  }
}
