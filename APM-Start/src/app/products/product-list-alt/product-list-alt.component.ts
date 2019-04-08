import { Component } from '@angular/core';

import { Product } from '../product';
import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html'
})
export class ProductListAltComponent  {
  pageTitle = 'Products';
  errorMessage = '';
  products: Product[] = [];

  constructor(
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(
      products => this.products = products,
      error => this.errorMessage = <any>error
    );
  }

  onSelected(productId: number): void {
    console.log('Not yet implemented');
  }
}
