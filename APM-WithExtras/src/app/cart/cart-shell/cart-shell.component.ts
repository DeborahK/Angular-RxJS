import { Component } from '@angular/core';

@Component({
  template: `
  <div class='row'>
    <div class='col-md-6'>
        <sw-cart-list></sw-cart-list>
    </div>
    <div class='col-md-6'>
        <sw-cart-total></sw-cart-total>
    </div>
  </div>
  `
})
export class CartShellComponent {

  constructor() { }

}
