import { Injectable } from "@angular/core";
import { combineLatest, map, scan, shareReplay, Subject } from "rxjs";

import { Action } from "../shared/edit-action";
import { Product } from "../products/product";
import { CartItem } from "./cart";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  // Add item action
  private itemSubject = new Subject<Action<CartItem>>();
  itemAction$ = this.itemSubject.asObservable();

  cartItems$ = this.itemAction$
    .pipe(
      scan((items, itemAction) => this.modifyCart(items, itemAction), [] as CartItem[]),
      shareReplay(1)
    );

  // Total up the extended price for each item
  subTotal$ = this.cartItems$.pipe(
    map(items => items.reduce((a, b) => a + (b.quantity * Number(b.product.price)), 0)),
  );

  // Delivery is free if spending more than $30
  deliveryFee$ = this.subTotal$.pipe(
    map((t) => (t < 30 ? 5.99 : 0))
  );

  // Tax could be based on shipping address zip code
  tax$ = this.subTotal$.pipe(
    map((t) => Math.round(t * 10.75) / 100)
  );

  // Total price
  totalPrice$ = combineLatest([
    this.subTotal$,
    this.deliveryFee$,
    this.tax$,
  ]).pipe(map(([st, d, t]) => st + d + t));

  // Add the product to the cart as an Action<CartItem>
  addToCart(product: Product): void {
    this.itemSubject.next({
      item: { product, quantity: 1 },
      action: 'add'
    });
  }

  // Remove the item from the cart
  removeFromCart(cartItem: CartItem): void {
    this.itemSubject.next({
      item: { product: cartItem.product, quantity: 0 },
      action: 'delete'
    });
  }

  updateInCart(cartItem: CartItem, quantity: number) {
    this.itemSubject.next({
      item: { product: cartItem.product, quantity },
      action: 'update'
    });
  }

  // Return the updated array of cart items
  private modifyCart(items: CartItem[], operation: Action<CartItem>): CartItem[] {
    if (operation.action === 'add') {
      return [...items, operation.item];
    } else if (operation.action === 'update') {
      return items.map(item => item.product.id === operation.item.product.id ? operation.item : item)
    } else if (operation.action === 'delete') {
      return items.filter(item => item.product.id !== operation.item.product.id);
    }
    return [...items];
  }

}
