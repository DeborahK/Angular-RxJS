/* Defines the supplier entity */
export interface Supplier {
  id: number;
  name: string;
  cost: number;
  minQuantity: number;
}

//
// Extras not included in the course
//

// Provided to demonstrate how to map to
// class instances.
export class SupplierClass {
  id: number = 0;
  name: string = '';
  cost?: number;
  minQuantity?: number;

  upliftCost(): void {
    this.cost = this.cost ? this.cost * 1.1 : 0;
  }
}