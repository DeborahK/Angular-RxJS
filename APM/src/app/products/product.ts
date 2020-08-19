/* Defines the product entity */
export interface Product {
  id: number;
  productName: string;
  productCode?: string;
  description?: string;
  price?: number;
  categoryId?: number;
  quantityInStock?: number;
  searchKey?: string[];
  supplierIds?: number[];
}
