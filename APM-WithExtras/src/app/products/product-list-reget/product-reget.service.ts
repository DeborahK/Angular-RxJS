import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, catchError, combineLatest, combineLatestWith, concatMap, map, merge, Observable, of, scan, shareReplay, Subject, tap, throwError } from 'rxjs';

import { Product } from '../product';
import { ProductCategoryService } from '../../product-categories/product-category.service';
import { Action } from '../../shared/edit-action';

/*
  Demonstrates create, update, and delete operations
  With a re-get to ensure fresh data after every
  operation.
*/
@Injectable({
  providedIn: 'root'
})
export class ProductRegetService {
  private productsUrl = 'api/products';
  private emptyProduct!: Product;

  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();

  // Action Stream for adding/updating/deleting products
  private productModifiedSubject = new BehaviorSubject<Action<Product>>({
    item: this.emptyProduct,
    action: 'none'
  });
  productModifiedAction$ = this.productModifiedSubject.asObservable();

  // Save the product via http
  // And then reget the products to have fresh data.
  productsWithCRUD$ = merge(
    this.products$,
    this.productModifiedAction$
      .pipe(
        concatMap(operation => this.saveProduct(operation)),
        concatMap(() => this.getProducts())
      ));

  // Support methods

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl)
      .pipe(
        combineLatestWith(this.productCategoryService.productCategories$),
        map(([products, categories]) =>
          products.map(product => ({
            ...product,
            price: product.price ? product.price * 1.5 : 0,
            category: categories.find(c => product.categoryId === c.id)?.name,
            searchKey: [product.productName]
          } as Product))
        ),
        // Emit the data into the stream
        tap(productsWithCategories => this.productsSubject.next(productsWithCategories)),
        tap(data => console.log('Products: ', JSON.stringify(data))),
        catchError(this.handleError)
      )
  };

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
          // Return the original product so it can replace the product in the array
          map(() => ({ item: product, action: operation.action })),
          catchError(this.handleError)
        );
    }
    // If there is no operation, return the product
    return of(operation);
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
