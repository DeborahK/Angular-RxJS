import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, EMPTY, map, merge, Subject, tap } from 'rxjs';
import { ProductCategoryService } from 'src/app/product-categories/product-category.service';
import { ProductExtrasService } from '../product-extras.service';
import { ProductService } from '../product.service';

@Component({
  templateUrl: './product-list-refresh.component.html',
  styleUrls: ['./product-list-refresh.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListRefreshComponent {
  pageTitle = 'Product List (Refresh)';
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  products$ = combineLatest([
    this.productExtrasService.productsWithAdd$,
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

  // Whether data is currently loading
  isLoading$ = this.productExtrasService.isLoadingAction$;

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

  constructor(private productExtrasService: ProductExtrasService,
    private productCategoryService: ProductCategoryService
  ) { }

  onAdd(): void {
    this.productExtrasService.addProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }

  onRefresh(): void {
    this.productExtrasService.refreshData();
  }
}
