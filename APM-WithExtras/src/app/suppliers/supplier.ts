/* Defines the supplier entity */
export interface Supplier {
  id: number;
  name: string;
  cost: number;
  minQuantity: number;
}

// Provided to demonstrate how to map to
// class instances.
export class SupplierClass {
  id: number;
  name: string;
  cost: number;
  minQuantity: number;
}
