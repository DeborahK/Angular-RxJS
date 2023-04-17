import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { catchError, EMPTY, filter, map, Observable } from 'rxjs';

//import { Subscription } from 'rxjs';
import { ProductCategory } from '../product-categories/product-category';
import { ProductCategoryService } from '../product-categories/product-category.service';

import { Product } from './product';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  //implements OnInit {
  //, OnDestroy {
  pageTitle = 'Product List';
  errorMessage = '';
  categories: ProductCategory[] = [];
  selectedCategoryId = 1;

  products: Product[] = [];
  //sub!: Subscription;*/
  products$ = this.productService.productsWithCategory$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY; //or of([]);
    })
  ); //won't need type declaration once property is inferred when changing it to be more declarative: Observable<Product[]> | undefined; //return type is undefined so dont have to initilialize it

  /**Filtering emitted items */
  categories$ = this.productCategoryService.productCategories$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  /**New Observable for filtered List */
  productsSimpleFilter$ = this.productService.productsWithCategory$.pipe(
    map((products) =>
      products.filter((product) =>
        this.selectedCategoryId
          ? product.categoryId === this.selectedCategoryId
          : true
      )
    )
  );

  constructor(
    private productService: ProductService,
    private productCategoryService: ProductCategoryService
  ) {}

  /**
   * 
   * removed in favor of making more declarative by setting observable to property
   * ngOnInit(): void {
    //this.sub = this.productService.getProducts().subscribe({
      next: (products) => (this.products = products),
      error: (err) => (this.errorMessage = err),
    });
    this.products$ = this.productService.getProducts().pipe(
      catchError((err) => {
        this.errorMessage = err;
        return EMPTY; //or of([]);
      })
    );
  } */

  /*
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }*/

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    //console.log('Not yet implemented');
    this.selectedCategoryId = +categoryId; //+ to cast to number as is required to match === in the function
  }
  //} ngOnInit end
}
