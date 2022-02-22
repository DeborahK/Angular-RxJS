import { Component, Input } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { CartItem } from '../cart';
import { CartService } from '../cart.service';

@Component({
  selector: 'sw-cart-item',
  templateUrl: './cart-item.component.html'
})
export class CartItemComponent {
  // Use a setter to emit whenever a new item is set
  _item!: CartItem;
  get item(): CartItem {
    return this._item;
  }
  @Input() set item(item: CartItem) {
    this._item = item;
    this.itemChangedSubject.next(item);
  }

  // Hard-coded quantity
  // These could instead come from an inventory system
  qtyArr = [1, 2, 3, 4, 5, 6, 7, 8];

  // Item was changed action
  private itemChangedSubject = new BehaviorSubject<CartItem>(this.item);
  item$ = this.itemChangedSubject.asObservable();

  // When the item changes, recalculate the extended price
  exPrice$ = this.item$.pipe(
    map(it => it.quantity * Number(it.product.price))
  );

  constructor(private cartService: CartService) { }

  onQuantitySelected(quantity: number): void {
    // Update the quantity in the item
    this.cartService.updateInCart(this.item, quantity);
  }

  onRemove(): void {
    this.cartService.removeFromCart(this.item);
  }
}
