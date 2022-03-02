import { ChangeDetectionStrategy, Component } from '@angular/core';
import { catchError, pipe, map, Observable, of, EMPTY, filter } from 'rxjs';

import { ProductCategory } from '../product-categories/product-category';
import { ProductCategoryService } from "../product-categories/product-category.service";

import { Product } from './product';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  // categories: ProductCategory[] = [];
  selectedCategoryId = 1;

  products$ = this.productService.productWithCategory$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      //return empty array
      //  return of([]);
      return EMPTY;
    })
  );

  categories$
 = this.productCategoryService.productCategory$.pipe(
   catchError(error => {
     this.errorMessage = error;
     return EMPTY
   })
 )
  productsSimpleFilter$ = this.productService.productWithCategory$.pipe(
    // filter(items  => items.categoryId === this.selectedCategoryId) <--- this wont work
    map(products => products.filter(product => this.selectedCategoryId? product.categoryId === this.selectedCategoryId: true))
  )

  constructor(private productService: ProductService, private productCategoryService: ProductCategoryService) {}

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    // console.log('Not yet implemented');
    this.selectedCategoryId = +categoryId

  }
}
