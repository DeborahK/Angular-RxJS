import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, combineLatest, EMPTY, from, merge, Subject, throwError, of } from 'rxjs';
import {
  catchError, filter, map, mergeMap, scan, shareReplay, tap, toArray, switchMap,
  mergeAll, max, reduce, concatMap, delay
} from 'rxjs/operators';

import { Product, ProductClass } from './product';
import { ProductFromAPI } from './product-data-fromAPI';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  // All products
  products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products', JSON.stringify(data))),
      catchError(this.handleError)
    );

  // Combine products with categories
  // Map to the revised shape.
  // Be sure to specify the type to ensure after the map that it knows the correct type
  productsWithCategory$ = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$
  ]).pipe(
    map(([products, categories]) =>
      products.map(product => ({
        ...product,
        price: product.price * 1.5,
        category: categories.find(c => product.categoryId === c.id).name,
        searchKey: [product.productName]
      }) as Product)
    ),
    shareReplay(1)
  );

  // Action stream for product selection
  // Default to 0 for no product
  // Must have a default so the stream emits at least once.
  private productSelectedSubject = new BehaviorSubject<number>(0);
  // Expose the action as an observable for use by any components
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  // Currently selected product
  // Used in both List and Detail pages,
  // so use the shareReply to share it with any component that uses it
  // Location of the shareReplay matters ... won't share anything *after* the shareReplay
  selectedProduct$ = combineLatest([
    this.productsWithCategory$,
    this.productSelectedAction$
  ]).pipe(
    map(([products, selectedProductId]) =>
      products.find(product => product.id === selectedProductId)
    ),
    tap(product => console.log('selectedProduct', product)),
    shareReplay(1)
  );

  // Suppliers for the selected product
  // Finds suppliers from download of all suppliers
  // Add a catchError so that the display appears
  // even if the suppliers cannot be retrieved.
  // Note that it must return an empty array and not EMPTY
  // or the stream will complete.
  selectedProductSuppliers$ = combineLatest([
    this.selectedProduct$,
    this.supplierService.suppliers$
      .pipe(
        catchError(err => of([] as Supplier[]))
      )
  ]).pipe(
    map(([selectedProduct, suppliers]) =>
      suppliers.filter(
        supplier => selectedProduct ? selectedProduct.supplierIds.includes(supplier.id) : EMPTY
      )
    )
  );

  // Suppliers for the selected product
  // Only gets the suppliers it needs
  // SwitchMap here instead of mergeMap so quickly clicking on
  // the items cancels prior requests.
  selectedProductSuppliers2$ = this.selectedProduct$
    .pipe(
      filter(selectedProduct => Boolean(selectedProduct)),
      switchMap(selectedProduct =>
        from(selectedProduct.supplierIds)
          .pipe(
            mergeMap(supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)),
            toArray(),
            tap(suppliers => console.log('product suppliers', JSON.stringify(suppliers)))
          )
      )
    );

  /*
    Allows adding of products to the Observable
  */

  // Action Stream
  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  // Merge the streams
  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$
  )
    .pipe(
      scan((acc: Product[], value: Product) => [...acc, value])
    );

  /*
    Additional examples, not included in the course
  */

  // Retrieve products and map to increase price using mergeMap
  productsWithIncreasedPrice$ = this.productsWithCategory$
    .pipe(
      mergeAll(),
      map(product => ({
        ...product,
        price: product.price * 1.5,
        searchKey: [product.productName]
      }) as Product),
      toArray(),
      tap(data => console.log('Increase Price', JSON.stringify(data))),
      catchError(this.handleError)
    );

  // Mapping from API fields to new shape using mergeMap and toArray
  productsFromAPI1$ = this.http.get<ProductFromAPI[]>('api/productsFromAPI')
    .pipe(
      tap(data => console.log('Before mergeMap', JSON.stringify(data))),
      mergeMap(products => products),
      tap(data => console.log('After mergeMap', JSON.stringify(data))),
      map(product => ({
        id: product.p_id,
        productName: product.p_nam,
        productCode: product.p_cd,
        description: product.p_des,
        categoryId: product.p_c_fk_id,
        price: product.p_p * 1.5
      }) as Product),
      tap(data => console.log('After map', JSON.stringify(data))),
      toArray(),
      tap(data => console.log('After toArray', JSON.stringify(data))),
      catchError(this.handleError)
    );

  // Mapping from API fields to new shape using Array map
  productsFromAPI2$ = this.http.get<ProductFromAPI[]>('api/productsFromAPI')
    .pipe(
      tap(data => console.log('Before map', JSON.stringify(data))),
      map(products => products.map(product => ({
        id: product.p_id,
        productName: product.p_nam,
        productCode: product.p_cd,
        description: product.p_des,
        categoryId: product.p_c_fk_id,
        price: product.p_p * 1.5
      }) as Product)),
      tap(data => console.log('After map', JSON.stringify(data))),
      catchError(this.handleError)
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
      catchError(this.handleError)
    );

  // Returns the product with the highest price
  productMax$ = this.productsWithCategory$
    .pipe(
      mergeMap(item => item),
      max<Product>((a, b) => a.price < b.price ? -1 : 1),
      catchError(this.handleError)
    );

  // Totals the prices for all items
  productsTotal$ = this.productsWithCategory$
    .pipe(
      mergeMap(item => item),
      reduce<Product, number>((acc, item) => acc + item.price, 0),
      catchError(this.handleError)
    );

  // Emits one product at a time with a delay
  productsOneByOne$ = this.products$
    .pipe(
      mergeMap(item => item),
      concatMap(item => of(item).pipe(delay(500))),
      catchError(this.handleError)
    );
  /* END */

  constructor(private http: HttpClient,
              private productCategoryService: ProductCategoryService,
              private supplierService: SupplierService) {
    // To try out each of the additional examples
    // (which are not currently bound in the UI)
    // this.productsWithIncreasedPrice$.subscribe(console.log);
    // this.productsFromAPI1$.subscribe(console.log);
    // this.productsFromAPI2$.subscribe(console.log);
    // this.productsClassInstance$.subscribe(console.log);
    // this.productMax$.subscribe(console.log);
    // this.productsTotal$.subscribe(console.log);
    // this.productsOneByOne$.subscribe(console.log);
  }

  addProduct(newProduct?: Product) {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }

  // Change the selected product
  selectedProductChanged(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  private fakeProduct() {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
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

}
