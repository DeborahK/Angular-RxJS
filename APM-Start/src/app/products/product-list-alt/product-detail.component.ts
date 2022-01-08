import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { Supplier } from 'src/app/suppliers/supplier';
import { SupplierService } from 'src/app/suppliers/supplier.service';
import { Product } from '../product';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent implements OnInit{
  pageTitle$: Observable<string>;
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();
  selectedProduct$: Observable<Product>;
  suppliers$: Observable<Supplier[]>;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.selectedProduct$ = this.productService.selectedProduct$.pipe(
      catchError( err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    )
    this.suppliers$ = this.productService.selectedProductSuppliers2$.pipe(
      catchError( err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    )
    this.pageTitle$ = this.selectedProduct$.pipe(
      filter(selectedProduct => Boolean(selectedProduct)),
      map(selectedProduct => selectedProduct.productName ? 
        `Product Detail - ${selectedProduct.productName}`:'Product Detail')
    )
  }
}
