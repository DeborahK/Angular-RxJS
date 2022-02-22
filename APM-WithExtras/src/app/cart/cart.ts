import { Observable, of } from "rxjs";
import { Product } from "../products/product";

export interface Cart {
  cartItems: CartItem[]
}

export interface CartItem {
  product: Product;
  quantity: number;
}
