import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { catchError, combineLatest, concatMap, map, merge, Observable, of, scan, shareReplay, Subject, tap, throwError } from 'rxjs';

import { Product } from '../product';
import { ProductCategoryService } from '../../product-categories/product-category.service';
import { Action } from '../../shared/edit-action';

/*
  Demonstrates create, update, and delete operations
*/
@Injectable({
  providedIn: 'root'
})
export class ProductEditService {
  private productsUrl = 'api/products';

  products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products: ', JSON.stringify(data))),
      catchError(this.handleError)
    );

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

  // Action Stream for adding/updating/deleting products
  private productModifiedSubject = new Subject<Action<Product>>();
  productModifiedAction$ = this.productModifiedSubject.asObservable();

  // Save the product via http
  // And then create and buffer a new array of products with scan.
  productsWithCRUD$ = merge(
    this.productsWithCategory$,
    this.productModifiedAction$
      .pipe(
        concatMap(operation => this.saveProduct(operation))
      ))
    .pipe(
      scan((acc, value) =>
        (value instanceof Array) ? [...value] : this.modifyProducts(acc, value), [] as Product[]),
      shareReplay(1)
    );

  // Support methods
  // Save the product to the backend server
  // NOTE: This could be broken into three additional methods.
  headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  saveProduct(operation: Action<Product>): Observable<Action<Product>> {
    const product = operation.item;
    console.log('saveProduct', JSON.stringify(operation.item));
    if (operation.action === 'add') {
      // Assigning the id to null is required for the inmemory Web API
      // Return the product from the server
      return this.http.post<Product>(this.productsUrl, { ...product, id: null }, { headers: this.headers })
        .pipe(
          map(product => ({ item: product, action: operation.action })),
          catchError(this.handleError)
        );
    }
    if (operation.action === 'delete') {
      const url = `${this.productsUrl}/${product.id}`;
      return this.http.delete<Product>(url, { headers: this.headers })
        .pipe(
          // Return the original product so it can be removed from the array
          map(() => ({ item: product, action: operation.action })),
          catchError(this.handleError)
        );
    }
    if (operation.action === 'update') {
      const url = `${this.productsUrl}/${product.id}`;
      return this.http.put<Product>(url, product, { headers: this.headers })
        .pipe(
          tap(data => console.log('Updated Product: ' + JSON.stringify(data))),
          // Return the original product so it can replace the product in the array
          map(() => ({ item: product, action: operation.action })),
          catchError(this.handleError)
        );
    }
    // If there is no operation, return the product
    return of(operation);
  }

  // Modify the array of products
  modifyProducts(products: Product[], operation: Action<Product>): Product[] {
    if (operation.action === 'add') {
      // Return a new array with the added product pushed to it
      return [...products, operation.item];
    } else if (operation.action === 'update') {
      // Return a new array with the updated product replaced
      console.log('after modify', operation.item);
      return products.map(product => product.id === operation.item.id ? operation.item : product)
    } else if (operation.action === 'delete') {
      // Filter out the deleted product
      return products.filter(product => product.id !== operation.item.id);
    }
    return [...products];
  }

  constructor(private http: HttpClient,
              private productCategoryService: ProductCategoryService) {
  }

  addProduct(newProduct?: Product): void {
    newProduct = newProduct || this.fakeProduct();
    this.productModifiedSubject.next({
      item: newProduct,
      action: 'add'
    });
  }

  deleteProduct(selectedProduct: Product): void {
    this.productModifiedSubject.next({
      item: selectedProduct,
      action: 'delete'
    });
  }

  updateProduct(selectedProduct: Product): void {
    // Update a copy of the selected product
    const updatedProduct = {
      ...selectedProduct,
      quantityInStock: selectedProduct.quantityInStock ? selectedProduct.quantityInStock + 1 : 1
    } as Product;
    this.productModifiedSubject.next({
      item: updatedProduct,
      action: 'update'
    });
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
