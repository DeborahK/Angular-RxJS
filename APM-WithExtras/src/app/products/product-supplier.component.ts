import { Component, OnInit } from '@angular/core';

import { combineLatest, BehaviorSubject, EMPTY, Subject } from 'rxjs';

import { ProductService } from './product.service';

@Component({
  selector: 'pm-product-supplier',
  templateUrl: './product-supplier.component.html'
})
export class ProductSupplierComponent {
  pageTitle = 'Product List';
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  productsWithSupplier$ = this.productService.productsWithSupplier$;

  constructor(private productService: ProductService) { }

}
