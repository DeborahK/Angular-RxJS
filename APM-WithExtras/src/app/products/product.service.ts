import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, throwError, Subject, merge, from, combineLatest, ReplaySubject } from 'rxjs';
import {
  catchError, tap, map, mergeMap, delay, concatMap, filter,
  reduce, max, startWith, toArray, mergeAll, scan, shareReplay, switchMap
} from 'rxjs/operators';

import { Product, ProductClass } from './product';
import { ProductFromAPI } from './product-data-fromAPI';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { SupplierService } from '../suppliers/supplier.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';

  // Retrieve products and map to desired shape
  products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products', JSON.stringify(data))),
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );

  // Combine products with categories
  // And map category id to category name
  // Be sure to specify the type to ensure after the map that it knows the correct type
  productsWithCategory$ = combineLatest(
    this.products$,
    this.productCategoryService.productCategories$
  ).pipe(
    map(([products, categories]) =>
      products.map(
        product =>
          ({
            ...product,
            price: product.price * 1.5,
            searchKey: [product.category],
            category: categories.find(c => product.categoryId === c.id).name
          } as Product) // <-- note the type here!
      )
    ),
    shareReplay()
  );

  productsWithCategory2$ = combineLatest(
    this.products$,
    this.productCategoryService.productCategories$
  )
    .pipe(
      mergeAll(),
      tap(data => console.log('After mergeAll', JSON.stringify(data))),
      map(product => ({
        ...product
      })),
      toArray(),
      tap(data => console.log('After toArray', JSON.stringify(data))),
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );

  // Use ReplaySubject to "replay" values to new subscribers
  // ReplaySubject buffers the defined number of values, in this case 1.
  // Retains the currently selected product Id
  // Uses 0 for no selected product (can't use null because it is used as a route parameter)
  private selectProductAction = new ReplaySubject<number>(1);
  // Expose the selectedProduct as an observable for use by any components
  selectProductAction$ = this.selectProductAction.asObservable();

  // Currently selected product
  // Used in both List and Detail pages,
  // so use the shareReply to share it with any component that uses it
  // Location of the shareReplay matters ... won't share anything *after* the shareReplay
  selectedProduct$ = combineLatest(
    this.selectProductAction$,
    this.productsWithCategory$
  ).pipe(
    map(([selectedProductId, products]) =>
      products.find(product => product.id === selectedProductId)
    ),
    tap(product => console.log('selectedProduct', product)),
    shareReplay(),
    catchError(this.handleError)
  );

  // SwitchMap here instead of mergeMap so quickly clicking on
  // the items cancels prior requests.
  selectedProductSuppliers$ = this.selectedProduct$.pipe(
    switchMap(product =>
      product ? this.supplierService.getSuppliersByIds(product.supplierIds) : of(null)
    ),
    catchError(this.handleError)
  );

  /*
    Code from prior examples
  */

  // Retrieve products and map to increase price using mergeMap
  productsWithIncreasedPrice1$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      mergeAll(),
      map(product => ({
        ...product,
        price: product.price * 1.5,
        searchKey: [product.category]
      })),
      toArray(),
      tap(data => console.log('Increase Price', JSON.stringify(data))),
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );

  // Retrieve products and map to increase price using mergeAll
  productsWithIncreasedPrice2$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      mergeAll(),
      map(item => ({ ...item, price: item.price * 1.5 } as Product)),
      toArray(),
      tap(data => console.log('Increase Price', JSON.stringify(data))),
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );

  // Retrieve products and map to increase price using array map
  productsWithIncreasedPrice3$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      map(products => products.map(p => ({ ...p, price: p.price * 1.5 } as Product))),
      tap(data => console.log('Increase Price', JSON.stringify(data))),
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );

  // Mapping from API fields to new shape using mergeMap and toArray
  productsFromAPI1$ = this.http.get<ProductFromAPI[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Before mergeMap', JSON.stringify(data))),
      mergeMap(products => products),
      tap(data => console.log('After mergeMap', JSON.stringify(data))),
      map(product => ({
        id: product.p_id,
        productName: product.p_nam,
        productCode: product.p_cd,
        description: product.p_des,
        price: product.p_p
      }) as Product),
      tap(data => console.log('After map', JSON.stringify(data))),
      map(product => ({ ...product, price: product.price * 1.5 })),
      tap(data => console.log('After 2nd map', JSON.stringify(data))),
      toArray(),
      tap(data => console.log('After toArray', JSON.stringify(data))),
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );

  // Mapping from API fields to new shape using Array map
  productsFromAPI2$ = this.http.get<ProductFromAPI[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Before map', JSON.stringify(data))),
      map(products => products.map(product => ({
        id: product.p_id,
        productName: product.p_nam,
        productCode: product.p_cd,
        description: product.p_des,
        price: product.p_p * 1.5
      }) as Product)),
      tap(data => console.log('After map', JSON.stringify(data))),
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );

  // Mapping to a class instance
  productsClassInstance$ = this.http.get<ProductClass[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Before map', JSON.stringify(data))),
      map(products => products.map(product => {
        const productInstance: ProductClass = Object.assign(new ProductClass(), {
          ...product,
          price: product.price * 1.5,
          searchKey: [product.category]
        });
        productInstance.inventoryValuation = productInstance.calculateValuation();
        return productInstance;
      })),
      tap(data => console.log('After map', JSON.stringify(data))),
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );

  /*

Allows adding of products to the Observable

*/
  private productInsertAction = new Subject<Product>();
  productInsertAction$ = this.productInsertAction.asObservable();

  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertAction
  )
    .pipe(
      scan((acc: Product[], value: Product) => [...acc, value]),
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );

  addOne() {
    this.productInsertAction.next({
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    });
  }

  constructor(private http: HttpClient,
    private productCategoryService: ProductCategoryService,
    private supplierService: SupplierService) { }

  // Change the selected product
  changeSelectedProduct(selectedProductId: number | null): void {
    this.selectProductAction.next(selectedProductId);
  }

  // @@@ Used?
  getProductsByCategory(category: string): Observable<Product> {
    return this.http.get<Product[]>(this.productsUrl)
      .pipe(
        mergeMap(item => item),
        filter(item => item.category === category),
        catchError(this.handleError)
      );
  }

  private handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

  /*

    Additional examples, not included in the course

  */

  // Returns the product with the highest price
  getProductMax(): Observable<Product> {
    return this.http.get<Product[]>(this.productsUrl)
      .pipe(
        mergeMap(item => item),
        max<Product>((a, b) => a.price < b.price ? -1 : 1),
        catchError(this.handleError)
      );
  }

  // Totals the prices for all items
  getProductsTotal(): Observable<number> {
    return this.http.get<Product[]>(this.productsUrl)
      .pipe(
        mergeMap(item => item),
        reduce<Product, number>((acc, item) => acc + item.price, 0),
        catchError(this.handleError)
      );
  }

  // Emits one product at a time with a delay
  // The component must then manually push each returned
  // product to an array, subscribe, and bind to the array
  getProductsOneByOne(): Observable<Product> {
    return this.http.get<Product[]>(this.productsUrl)
      .pipe(
        mergeMap(item => item),
        concatMap(item => of(item).pipe(delay(500))),
        catchError(this.handleError)
      );
  }
  // Component code:
  // NOTE: Does not work with OnPush change detection
  // products: Product[] = [];
  // ngOnInit(): void {
  //   this.productService.getProductsOneByOne()
  //     .pipe(tap(product => this.products.push(product)))
  //     .subscribe(console.log);
  // }
}
