import { ChangeDetectionStrategy, Component } from '@angular/core';
import { catchError, EMPTY, map, Subject } from 'rxjs';
import { Supplier } from 'src/app/suppliers/supplier';
import { Product } from '../product';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  private errorMessageSubject = new Subject<string> ();
  errorMessage$ = this.errorMessageSubject.asObservable();

  product$ = this.productService.selectedProducts$
    .pipe(
      catchError(err => {
        this.errorMessageSubject = err;
        return EMPTY;
      }));

  pageTitle$ = this.product$
      .pipe(
        map(p => p ? `Product Detail for: ${p.productName}`: null)
      );

  productSuppliers$ = this.productService.selectedProductSuppliers$
      .pipe(
        catchError(err => {
          this.errorMessageSubject = err;
         return EMPTY;
        }));



  constructor(private productService: ProductService) { }

}
