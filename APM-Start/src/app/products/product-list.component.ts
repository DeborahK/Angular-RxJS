import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { catchError, EMPTY, Observable } from 'rxjs';

//import { Subscription } from 'rxjs';
import { ProductCategory } from '../product-categories/product-category';

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

  products: Product[] = [];
  //sub!: Subscription;*/
  products$ = this.productService.products$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY; //or of([]);
    })
  ); //won't need type declaration once property is inferred when changing it to be more declarative: Observable<Product[]> | undefined; //return type is undefined so dont have to initilialize it

  constructor(private productService: ProductService) {}

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
    console.log('Not yet implemented');
  }
  //} ngOnInit end
}
