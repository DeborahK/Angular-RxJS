import { Component } from '@angular/core';
import { CartService } from '../cart.service';

@Component({
  selector: 'sw-cart-list',
  template: `
  <div *ngFor="let item of cartItems$ | async">
     <sw-cart-item [item]='item'></sw-cart-item>
  </div>
  `
})
export class CartListComponent {

  cartItems$ = this.cartService.cartItems$;

  constructor(private cartService: CartService) { }

}
