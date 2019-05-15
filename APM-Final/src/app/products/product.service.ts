import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, combineLatest, from, of, merge, Subject, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, scan, shareReplay, tap, toArray } from 'rxjs/operators';

import { Product } from './product';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products', JSON.stringify(data))),
      catchError(this.handleError)
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
    shareReplay(1)
  );

  // Default to no product selected
  private productSelectedAction$ = new BehaviorSubject<number>(0);

  // Currently selected product
  // Used in both List and Detail pages,
  // so use the shareReply to share it with any component that uses it
  selectedProduct$ = combineLatest(
    this.productsWithCategory$,
    this.productSelectedAction$
  ).pipe(
    map(([products, selectedProductId]) =>
      products.find(product => product.id === selectedProductId)
    ),
    tap(product => console.log('selectedProduct', product)),
    shareReplay(1),
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
  private productInsertedAction$ = new Subject<Product>();

  // Merge the streams
  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$
  )
    .pipe(
      scan((acc: Product[], value: Product) => [...acc, value]),
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );

  constructor(private http: HttpClient,
    private productCategoryService: ProductCategoryService,
    private supplierService: SupplierService) { }

  addProduct(newProduct?: Product) {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedAction$.next(newProduct);
  }

  // Change the selected product
  selectedProductChanged(selectedProductId: number): void {
    this.productSelectedAction$.next(selectedProductId);
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
