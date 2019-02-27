import { Component, OnInit, DoCheck } from '@angular/core';

import { Product } from './product';
import { ProductService } from './product.service';
import { interval } from 'rxjs';
import { NumberValueAccessor } from '@angular/forms/src/directives';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, DoCheck {
  pageTitle = 'Product List';
  errorMessage = '';
  products: Product[] = [];
  productTotal: number;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    // this.productService.getProducts().subscribe(
    //   products => {
    //     this.products = products;
    //     console.log(this.products);
    //   },
    //   error => this.errorMessage = <any>error
    // );

    // This logs "undefined"
    // console.log(this.products);

    // this.productService.getProductsOneByOne().subscribe(
    //   product => {
    //     //console.log('Before timeout');
    //     //setTimeout(() => {
    //       this.products.push(product);
    //       console.log(product);
    //     //}, 1000);
    //   },
    //   error => this.errorMessage = <any>error
    // );

    // this.productService.getProductsByCategory('Garden').subscribe(
    //   product => {
    //       this.products.push(product);
    //       console.log(product);
    //   },
    //   error => this.errorMessage = <any>error
    // );

    this.productService.getProductMax().subscribe(
      product => {
          this.products.push(product);
          console.log(product);
      },
      error => this.errorMessage = <any>error
    );

    this.productService.getProductsTotal().subscribe(
      total => this.productTotal = total
    )
  }

  ngDoCheck() {
    console.log("In do check");
  }

  trackByFunction(index, item: Product) {
    return item.id;
  }

}
