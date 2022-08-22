import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';

import { catchError, map, Observable, tap, throwError } from 'rxjs';

import { Product } from './product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = 'api/suppliers';

  //set observable to result of http get. hover over products$ shows we have an observable that emits an array of products
  //tip: hover over observable property to see if you are getting what you expect
  products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    map((products) =>
      products.map(
        (product) =>
          ({
            ...product, //spread operator
            price: product.price ? product.price * 1.5 : 0,
            searchKey: [product.productName],
          } as Product) //strongly type because expecting a return type of Product. cast to product type
      )
    ), //map emitted observable to product array, then map the product.price element and then transfrom price to a 50% increase. Because the price was specified as nullible in interface, use conditional to handle it. '?' = if product.price has value, multiply by 1.5, ':' otherwise it's 0. product.price ? product.price * 1.5 : 0,
    tap((data) => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  constructor(private http: HttpClient) {}

  /**
   * replaced with  products$ = ... to make more declarative
   *   getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl).pipe(
      tap((data) => console.log('Products: ', JSON.stringify(data))),
      catchError(this.handleError)
    ); //uses interface created in product.ts. Have to handle error in product-list compoenent that calls the getProducts method
  }
   */

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      // category: 'Toolbox',
      quantityInStock: 30,
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
