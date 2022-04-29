import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { BehaviorSubject, catchError, combineLatest, concatMap, delay, EMPTY, map, max, merge, mergeMap, Observable, of, reduce, scan, shareReplay, Subject, switchMap, tap, throwError } from 'rxjs';

import { Product, ProductClass, ProductWithSupplier } from '../product';
import { ProductCategoryService } from '../../product-categories/product-category.service';
import { SupplierService } from '../../suppliers/supplier.service';
import { ProductFromAPI } from '../product-data-fromAPI';
import { SupplierClass } from '../../suppliers/supplier';
import { ProductService } from '../product.service';

/*
  Additional examples, not included in the course
*/
@Injectable({
  providedIn: 'root'
})
export class ProductExtrasService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  //#region Data cache refresh feature with loading indicator
  // To try this out, use the refresh button on the Product List (with Refresh) option
  // NOTE: The refreshed data won't have any of the added products since this service
  //       does not save any added products.
  private refresh = new BehaviorSubject<void>(undefined);

  // Action stream for loading
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoadingAction$ = this.isLoadingSubject.asObservable();

  products$ = this.refresh
    .pipe(
      tap(() => this.isLoadingSubject.next(true)),
      mergeMap(() => this.http.get<Product[]>(this.productsUrl)
        .pipe(
          tap(data => console.log('Refreshed Products', JSON.stringify(data))),
          catchError(this.handleError)
        )),
      tap(() => this.isLoadingSubject.next(false)),
      shareReplay(1)
    );

  // Refresh the data
  refreshData(): void {
    this.refresh.next();
  }
  //#endregion

  productsWithCategory$ = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$
  ]).pipe(
    map(([products, categories]) =>
      products.map(product => ({
        ...product,
        price: product.price ? product.price * 1.5 : 0,
        category: categories.find(c => product.categoryId === c.id)?.name,
        searchKey: [product.productName]
      } as Product))
    ),
    shareReplay(1)
  );

  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$
  ).pipe(
    scan((acc, value) =>
      (value instanceof Array) ? [...value] : [...acc, value], [] as Product[])
  )

  //#region Mapping to a class instance
  // To try this out, uncomment the subscribe in the constructor and select Products (With Extras)
  productsClassInstance$ = this.http.get<ProductClass[]>(this.productsUrl)
    .pipe(
      map(products => products.map(product => {
        const productInstance: ProductClass = Object.assign(new ProductClass(), {
          ...product,
          price: product.price ? product.price * 1.5 : 0,
          searchKey: [product.category]
        });
        productInstance.inventoryValuation = productInstance.calculateValuation();
        return productInstance;
      })),
      catchError(this.handleError)
    );

  // Demonstrates multiple levels of the object graph
  // To try this out, uncomment the subscribe in the constructor and select Products (With Extras)
  // NOTE: Error handling is not shown
  productsClassInstanceMultipleLevels$ = combineLatest([
    this.http.get<ProductClass[]>(this.productsUrl)
      .pipe(
        // Map to product objects
        map(products => products.map(product =>
          Object.assign(new ProductClass(), { ...product } as ProductClass)))
      ),
    this.http.get<SupplierClass[]>(this.suppliersUrl)
      .pipe(
        // Map to supplier objects
        map(suppliers => suppliers.map(supplier =>
          Object.assign(new SupplierClass(), { ...supplier } as SupplierClass)))
      )
  ]).pipe(
    map(([products, suppliers]) =>
      products.map(productInstance => {
        // Associate the suppliers with the products
        productInstance.suppliers = suppliers.filter(supplier => productInstance?.supplierIds?.includes(supplier.id));
        // Since we are now working with an instance of the class, we can call the associated methods
        productInstance.inventoryValuation = productInstance.calculateValuation();
        productInstance.suppliers.map(supplier => supplier.upliftCost());
        return productInstance;
      }))
  );
  //#endregion

  //#region Emit one product at a time with a delay
  productsOneByOne$ = this.products$
    .pipe(
      mergeMap(products => products),  // Flatten the array
      concatMap(product => of(product).pipe(delay(1000))),
      catchError(this.handleError)
    );
  //#endregion

  //#region Merge products with their suppliers: one line per product/supplier.
  // Be sure to specify the type to ensure after the map that it knows the correct type
  productsWithSupplier$ = combineLatest([
    this.productsWithCategory$,
    this.supplierService.suppliers$,
  ]).pipe(
    map(([products, suppliers]) =>
      products.reduce(
        (result, product) =>
          result.concat(
            suppliers
              .filter((s) => product.supplierIds?.includes(s.id))
              .map(supplier => ({
                ...product,
                supplier: supplier.name,
              }))
          ),
        [] as ProductWithSupplier[]
      )
    ),
    shareReplay(1)
  );
  //#endregion

  //#region Mapping from API fields to new shape
  // NOTE: This required changes to the setup of the inmemory Web API
  // To try this out, uncomment the subscribe in the constructor and select Products (With Extras)
  productsFromAPI$ = this.http.get<ProductFromAPI[]>('api/productsFromAPI')
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
  //#endregion

  //#region Returns the product with the highest price
  // NOTE: Can't use the products$ from this service because it is based on a Subject that doesn't complete.
  productMax$ = this.productService.products$
    .pipe(
      mergeMap(item => item),
      max<Product>((a, b) => (a.price ?? 0) < (b.price ?? 0) ? -1 : 1),
      catchError(this.handleError)
    );
  //#endregion

  //#region Totals the prices for all items
  // NOTE: Can't use the products$ from this service because it is based on a Subject that doesn't complete.
  productTotal$ = this.productService.products$
    .pipe(
      mergeMap(item => item),
      reduce<Product, number>((acc, item) => acc + (item.price ?? 0), 0),
      catchError(this.handleError)
    );
  //#endregion

  constructor(private http: HttpClient,
              private productService: ProductService,
              private productCategoryService: ProductCategoryService,
              private supplierService: SupplierService) {
    // this.productsClassInstance$.subscribe(data => console.table(data));
    // this.productsClassInstanceMultipleLevels$.subscribe(data => console.log('Class Instances', JSON.stringify(data)));
    // this.productsFromAPI$.subscribe(data => console.table(data));
    // this.productMax$.subscribe(data => console.log('Max price', data.price));
    // this.productTotal$.subscribe(data => console.log('Total of all prices', data));
  }

  addProduct(newProduct?: Product) {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }

  private fakeProduct(): Product {
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

  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.message}`;
    }
    console.error(err);
    return throwError(() => errorMessage);
  }


}
