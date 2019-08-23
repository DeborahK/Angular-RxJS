import { Supplier } from '../suppliers/supplier';

/* Defines the product entity */
export interface Product {
  id: number;
  productName: string;
  productCode?: string;
  description?: string;
  price?: number;
  categoryId?: number;
  category?: string;
  quantityInStock?: number;
  searchKey?: string[];
  supplierIds?: number[];
  suppliers?: Supplier[]; // To demonstrate a nested object graph
  status?: StatusCode;    // Identifies current status of the item
}

export enum StatusCode {
  Unchanged,
  Added,
  Deleted,
  Updated
}

export interface ProductResolved {
  product: Product;
  error?: any;
}

// Provided to demonstrate how to map to
// class instances.
export class ProductClass {
  id: number;
  productName: string;
  productCode?: string;
  description?: string;
  price?: number;
  category?: string;
  quantityInStock?: number;
  searchKey?: string[];
  inventoryValuation?: number;
  suppliers?: Supplier[];

  calculateValuation(): number {
    const price = this.price ? this.price : 0;
    const quantity = this.quantityInStock ? this.quantityInStock : 0;
    return price * quantity;
  }
}
