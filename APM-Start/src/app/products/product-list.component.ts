import { Component, OnInit } from '@angular/core';

import { BehaviorSubject, combineLatest, EMPTY, Observable, Subject } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { ProductCategory } from '../product-categories/product-category';
import { ProductCategoryService } from '../product-categories/product-category.service';

import { Product } from './product';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  pageTitle = 'Product List';
  errorMessage = '';

  products$: Observable<Product[]>;
  productsSimpleFilter$: Observable<Product[]>;
  categories$: Observable<ProductCategory[]>;
  /* selectedCategoryId = 1; */
  /* private categorySelectedSubject = new Subject<number>(); */
  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();
 
  constructor(private productService: ProductService, private productCategoryService: ProductCategoryService) { }

  ngOnInit(): void {
    this.categories$ = this.productCategoryService.productCategories$.pipe(
      catchError( err => {
        this.errorMessage = err;
        return EMPTY;
      })
    )

    this.productsSimpleFilter$ = combineLatest(
      this.productService.productsAdd$,
      this.categorySelectedAction$
      /* .pipe(startWith(0)) */
    ).pipe(
      map(([products, categoryId]) => 
        products.filter(product => categoryId ? product.categoryId === categoryId : true)),
      catchError( err => {
        this.errorMessage = err;
        return EMPTY;
      })
    )

    /* this.products$ = this.productService.productsWithCategory$.pipe(
      catchError( err => {
        this.errorMessage = err;
        return EMPTY;
      })
    ) */
   
    /* this.products$ = this.productService.getProducts()
    .pipe(
      catchError(err => {
        this.errorMessage =err;
        return EMPTY
      })
    ) */
  }

  onAdd(): void {
    console.log(111);
    
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
