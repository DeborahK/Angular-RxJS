import { Component, OnInit } from '@angular/core';

import { ProductService } from '../product.service';

@Component({
    templateUrl: './product-shell.component.html'
})
export class ProductShellComponent {
    pageTitle = 'Products';
}
