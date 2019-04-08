import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {

  constructor(private productService: ProductService) { }

}
