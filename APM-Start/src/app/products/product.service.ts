import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, combineLatest, EMPTY, from, merge, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, scan, shareReplay, switchMap, tap, toArray } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategory } from '../product-categories/product-category';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private productSelectedSubject = new Subject<number>();
  private productSelectedAction$ = this.productSelectedSubject.asObservable();

  private productAddSubject = new Subject<Product>();
  private productAddAction$ = this.productAddSubject.asObservable();

  products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    tap(data => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  productsWithCategory$ = combineLatest([
    this.products$, 
    this.productCategoryService.productCategories$
  ]).pipe(
    map(([products,categories]) =>
      products.map( product => ({
        ...product,
        price: product.price *1.5,
        category: categories.find(category => category.id === product.categoryId).name,
        searchKey:[product.productName]
      })as Product)),
    shareReplay(1)
  );

  productsAdd$ = merge(
    this.productsWithCategory$, 
    this.productAddAction$
  ).pipe(
    scan((acc: Product[], value: Product) => [...acc, value])
  );

  selectedProduct$ = combineLatest([
    this.productsWithCategory$,
    this.productSelectedAction$
  ]).pipe(
    map(([products, productId]) => products.find(product => product.id === productId)),
    shareReplay(1),
    catchError(this.handleError)
  );

  selectedProductSuppliers$ = combineLatest([
    this.selectedProduct$,
    this.supplierService.suppliers$.pipe(
      catchError(err => of([] as Supplier[]))
    )
  ]).pipe(
    map(([selectedProduct, suppliers]) => suppliers.filter(
      supplier => selectedProduct ? selectedProduct.supplierIds.includes(supplier.id): EMPTY)),
    catchError(this.handleError)
  );

  selectedProductSuppliers2$ = this.selectedProduct$
    .pipe(
      filter(selectedProduct => Boolean(selectedProduct)),
      switchMap(selectedProduct => 
        from(selectedProduct.supplierIds)
          .pipe(
            mergeMap(supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)),
            toArray(),
            tap(data => console.log(data))
          )
      )
    )

  private suppliersUrl = this.supplierService.suppliersUrl;

  constructor(private http: HttpClient,
              private supplierService: SupplierService,
              private productCategoryService: ProductCategoryService) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl)
      .pipe(
        tap(data => console.log('Products: ', JSON.stringify(data))),
        catchError(this.handleError)
      );
  }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      // category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any): Observable<never> {
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

  selectedProductChanged(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId)
  }

  addProduct(newProduct?: Product):void {
    newProduct = newProduct || this.fakeProduct();
    this.productAddSubject.next(newProduct);
  }
}
