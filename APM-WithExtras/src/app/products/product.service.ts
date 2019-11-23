import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, combineLatest, EMPTY, from, merge, Subject, throwError, of, forkJoin } from 'rxjs';
import {
  catchError, filter, map, mergeMap, scan, shareReplay, tap, toArray, switchMap,
  mergeAll, max, reduce, concatMap, delay
} from 'rxjs/operators';

import { Product, ProductClass, StatusCode } from './product';
import { ProductFromAPI } from './product-data-fromAPI';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { Supplier, SupplierClass } from '../suppliers/supplier';
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

  // To support a refresh feature
  private refresh = new BehaviorSubject<boolean>(true);

  products2$ = this.refresh
    .pipe(
      mergeMap(() => this.http.get<Product[]>(this.productsUrl)
        .pipe(
          tap(data => console.log('Products', JSON.stringify(data))),
          catchError(this.handleError)
        )
      ));

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

  // Action Stream for adding products to the Observable
  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  // Add the newly added product via http post with concatMap
  // And then to the full list of products with scan.
  headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$
      .pipe(
        concatMap(newProduct => {
          newProduct.id = null;
          return this.http.post<Product>(this.productsUrl, newProduct, { headers: this.headers })
            .pipe(
              tap(product => console.log('Created product', JSON.stringify(product))),
              catchError(this.handleError)
            );
        }),
      ))
    .pipe(
      scan((acc: Product[], value: Product) => [...acc, value]),
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
    this.productsWithAdd$,
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
  // switchMap here instead of mergeMap so quickly clicking on the items cancels prior requests.
  // Using mergeMap and toArray
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
    Additional examples, not included in the course
  */

  // Suppliers for the selected product
  // Only gets the suppliers it needs
  // switchMap here instead of mergeMap so quickly clicking on the items cancels prior requests.
  // Using forkJoin
  selectedProductSuppliers3$ = this.selectedProduct$
    .pipe(
      filter(selectedProduct => Boolean(selectedProduct)),
      tap(product => console.log('product', JSON.stringify(product))),
      switchMap(selectedProduct =>
        forkJoin(selectedProduct.supplierIds.map(supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)))
      ),
      tap(suppliers => console.log('product suppliers', JSON.stringify(suppliers))),
    );

  // Action stream for loading
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoadingAction$ = this.isLoadingSubject.asObservable();

  // Suppliers for the selected product with the loading action stream
  selectedProductSuppliers4$ = this.selectedProduct$
    .pipe(
      filter(selectedProduct => Boolean(selectedProduct)),
      tap(() => this.isLoadingSubject.next(true)),
      tap(product => console.log('product', JSON.stringify(product))),
      switchMap(selectedProduct =>
        forkJoin(selectedProduct.supplierIds.map(supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)))
      ),
      tap(suppliers => console.log('product suppliers', JSON.stringify(suppliers))),
      tap(() => this.isLoadingSubject.next(false))
    );

  // Suppliers for all products
  // Gets all products and all suppliers and merges them
  allProductsAndSuppliers$ = combineLatest([
    this.productsWithCategory$,
    this.supplierService.suppliers$
      .pipe(
        catchError(err => of([] as Supplier[]))
      )
  ]).pipe(
    map(([products, suppliers]) =>
      products.map(product => ({
        ...product,
        suppliers: product.suppliers = suppliers.filter(
          supplier => product.supplierIds.includes(supplier.id)
        )
      }) as Product)
    )
  );

  // Suppliers for all products
  // Gets all products and then the suppliers for each product
  // (Seems this would be less efficient than allProductsAndSuppliers$)
  allProductsAndSuppliers2$ = this.productsWithCategory$
    .pipe(
      switchMap(products => forkJoin(
        products.map(product =>
          forkJoin(product.supplierIds.map(supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)))
            .pipe(
              map(suppliers => ({
                ...product,
                suppliers: suppliers
              } as Product))
            )
        ))
      )
    );

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

  // Demonstrates multiple levels of the object graph
  productsClassInstanceMultipleLevels$ = this.http.get<ProductClass[]>(this.productsUrl)
    .pipe(
      map(products => products.map(product => Object.assign(new ProductClass(), {
        ...product,
        suppliers: (product.suppliers ? product.suppliers.map(supplier => Object.assign(new SupplierClass(), {
          ...supplier
        })) : [])
      })))
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
      mergeMap(products => products),  // Flatten the array
      concatMap(product => of(product).pipe(delay(500))),
      catchError(this.handleError)
    );

  // Action Stream for adding/updating/deleting products
  private productModifiedSubject = new Subject<Product>();
  productModifiedAction$ = this.productModifiedSubject.asObservable();

  // Save the product via http
  // And then modify the full list of products with scan.
  productsWithCRUD$ = merge(
    this.productsWithCategory$,
    this.productModifiedAction$
      .pipe(
        concatMap(product => this.saveProduct(product)),
      ))
    .pipe(
      scan((products: Product[], product: Product) => this.modifyProducts(products, product)),
      shareReplay(1)
    );

  // Support methods
  // Save the product to the backend server
  // NOTE: This could be broken into three additional methods.
  saveProduct(product: Product) {
    if (product.status === StatusCode.Added) {
      product.id = null;
      return this.http.post<Product>(this.productsUrl, product, { headers: this.headers })
        .pipe(
          tap(data => console.log('Created product', JSON.stringify(data))),
          catchError(this.handleError)
        );
    }
    if (product.status === StatusCode.Deleted) {
      const url = `${this.productsUrl}/${product.id}`;
      return this.http.delete<Product>(url, { headers: this.headers })
        .pipe(
          tap(data => console.log('Deleted product', product)),
          // Return the original product so it can be removed from the array
          map(() => product),
          catchError(this.handleError)
        );
    }
    if (product.status === StatusCode.Updated) {
      const url = `${this.productsUrl}/${product.id}`;
      return this.http.put<Product>(url, product, { headers: this.headers })
        .pipe(
          tap(data => console.log('Updated Product: ' + JSON.stringify(product))),
          // return the original product
          map(() => product),
          catchError(this.handleError)
        );
    }
  }

  // Modify the array of products
  modifyProducts(products: Product[], product: Product) {
    if (product.status === StatusCode.Added) {
      // Return a new array from the array of products + new product
      return [
        ...products,
        { ...product, status: StatusCode.Unchanged }
      ];
    }
    if (product.status === StatusCode.Deleted) {
      // Filter out the deleted product
      return products.filter(p => p.id !== product.id);
    }
    if (product.status === StatusCode.Updated) {
      // Return a new array with the updated product replaced
      return products.map(p => p.id === product.id ?
        { ...product, status: StatusCode.Unchanged } : p);
    }
  }
  /* END */

  constructor(private http: HttpClient,
    private productCategoryService: ProductCategoryService,
    private supplierService: SupplierService) {
    // To try out each of the additional examples
    // (which are not currently bound in the UI)
    // this.allProductsAndSuppliers$.subscribe(console.log);
    // this.allProductsAndSuppliers2$.subscribe(console.log);
    // this.productsWithIncreasedPrice$.subscribe(console.log);
    // this.productsFromAPI1$.subscribe(console.log);
    // this.productsFromAPI2$.subscribe(console.log);
    // this.productsClassInstance$.subscribe(console.log);
    // this.productsClassInstanceMultipleLevels$.subscribe(console.log);
    // this.productMax$.subscribe(console.log);
    // this.productsTotal$.subscribe(console.log);
    // this.productsOneByOne$.subscribe(console.log);
  }

  addProduct(newProduct?: Product) {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);

    // Alternate technique
    newProduct.status = StatusCode.Added;
    this.productModifiedSubject.next(newProduct);
  }

  deleteProduct(selectedProduct: Product) {
    // Update a copy of the selected product
    const deletedProduct = { ...selectedProduct };
    deletedProduct.status = StatusCode.Deleted;
    this.productModifiedSubject.next(deletedProduct);
  }

  updateProduct(selectedProduct: Product) {
    // Update a copy of the selected product
    const updatedProduct = { ...selectedProduct };
    updatedProduct.quantityInStock += 1;
    updatedProduct.status = StatusCode.Updated;
    this.productModifiedSubject.next(updatedProduct);
  }

  // Change the selected product
  selectedProductChanged(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  // Refresh the data.
  refreshData(): void {
    this.refresh.next(true);
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
      quantityInStock: 30,
      supplierIds: [5, 7, 8]
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
