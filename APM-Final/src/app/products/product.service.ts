import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, combineLatest, from, of, merge, Subject, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, scan, shareReplay, tap, toArray } from 'rxjs/operators';

import { Product } from './product';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { SupplierService } from '../suppliers/supplier.service';
import { Supplier } from '../suppliers/supplier';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';

  // Retrieve products
  products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products', JSON.stringify(data))),
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );

  // Combine products with categories
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

  // Default to no product selected
  private productSelectedAction = new BehaviorSubject<number>(0);

  // Currently selected product
  // Used in both List and Detail pages,
  // so use the shareReply to share it with any component that uses it
  selectedProduct$ = combineLatest(
    this.productSelectedAction,
    this.productsWithCategory$
  ).pipe(
    map(([selectedProductId, products]) =>
      products.find(product => product.id === selectedProductId)
    ),
    tap(product => console.log('selectedProduct', product)),
    shareReplay(),
    catchError(this.handleError)
  );

  // Suppliers for the selected product
  // Finds suppliers from download of all suppliers
  selectedProductSuppliers$ = combineLatest(
    this.selectedProduct$,
    this.supplierService.suppliers$
  ).pipe(
    map(([product, suppliers]) =>
      suppliers.filter(
        supplier => product ? product.supplierIds.includes(supplier.id) : of(null)
      )
    )
  );

  // Suppliers for the selected product
  // Only gets the suppliers it needs
  selectedProductSuppliers2$ = this.selectedProduct$
    .pipe(
      filter(Boolean),
      mergeMap(product =>
        from(product.supplierIds)
          .pipe(
            mergeMap(supplierId =>
              this.http.get<Supplier>(`${this.supplierService.suppliersUrl}/${supplierId}`)),
            toArray()
          )
      )
    );
  /*

    Allows adding of products to the Observable

  */

  // Action Stream
  private productInsertAction = new Subject<Product>();

  // Merge the streams
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
    this.productSelectedAction.next(selectedProductId);
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
