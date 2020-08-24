import { Component } from '@angular/core';

import { Subscription, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Product } from './product';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  categories;

  //products: Product[] = [];
  products$ : Observable<Product[]> = this.productService.productWithCategory$.pipe(
    catchError (err => {
      this.errorMessage = err;
      return of([]);
    })

  );

  sub: Subscription;

  constructor(private productService: ProductService) { }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    console.log('Not yet implemented');
  }
}
