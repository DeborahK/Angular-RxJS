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
}

export interface ProductResolved {
  product: Product;
  error?: any;
}

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

  calculateValuation(): number {
    const price = this.price ? this.price : 0;
    const quantity = this.quantityInStock ? this.quantityInStock : 0;
    return price * quantity;
  }
}
