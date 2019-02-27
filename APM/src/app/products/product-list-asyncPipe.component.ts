import { Component, OnInit } from '@angular/core';

import { Product } from './product';
import { ProductService } from './product.service';

import { Observable, Subject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  templateUrl: './product-list-asyncPipe.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListAsyncPipeComponent implements OnInit {
  pageTitle = 'Product List';
  products$: Observable<Product[] | null>;

  /* Use *either* error$ or errorMessage, not both */
  error$ = new Subject<string>();
  errorMessage = '';

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.products$ = this.productService.getProducts()
      .pipe(
        catchError(error => {
          /* Use *either* error$ or errorMessage, not both */
          this.error$.next(error);
          // this.errorMessage = error;
          return of(null);
        })
      );
  }
}
