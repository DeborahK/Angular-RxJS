import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, EMPTY, map, Subject } from 'rxjs';

import { ProductCategoryService } from 'src/app/product-categories/product-category.service';
import { ProductExtrasService } from './product-extras.service';

@Component({
  templateUrl: './product-list-extras.component.html',
  styleUrls: ['./product-list-extras.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListExtrasComponent {
  pageTitle = 'Product List (Extras)';
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  products$ = combineLatest([
    this.productExtrasService.productsWithSupplier$,
    this.categorySelectedAction$
  ])
    .pipe(
      map(([products, selectedCategoryId]) =>
        products.filter(product =>
          selectedCategoryId ? product.categoryId === selectedCategoryId : true
        )),
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    );

  categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    );

  vm$ = combineLatest([
    this.products$,
    this.categories$
  ])
    .pipe(
      map(([products, categories]) =>
        ({ products, categories }))
    );

  // Products emitted one at a time.
  product$ = this.productExtrasService.productsOneByOne$;

  constructor(private productExtrasService: ProductExtrasService,
    private productCategoryService: ProductCategoryService
    ) { }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
