import { Component, ChangeDetectionStrategy } from '@angular/core';

import { of, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent  {
  pageTitle = 'Products';
  error$ = new Subject<string>();

  products$ = this.productService.productsWithCategory$.pipe(
    catchError(error => {
      this.error$.next(error);
      return of(null);
    }));

  selectedProductId$ = this.productService.selectProductAction$;

  constructor(
    private productService: ProductService
  ) {}

  onSelected(productId: number): void {
    this.productService.changeSelectedProduct(productId);
  }
}
