import { Product } from './product';

export class ProductData {

  static products: Product[] = [
    {
      id: 1,
      productName: 'Leaf Rake',
      productCode: 'GDN-0011',
      description: 'Leaf rake with 48-inch wooden handle',
      price: 19.95,
      categoryId: 1,
      quantityInStock: 15,
      supplierIds: [1, 2]
    },
    {
      id: 2,
      productName: 'Garden Cart',
      productCode: 'GDN-0023',
      description: '15 gallon capacity rolling garden cart',
      price: 32.99,
      categoryId: 1,
      quantityInStock: 2,
      supplierIds: [3, 4]
    },
    {
      id: 5,
      productName: 'Hammer',
      productCode: 'TBX-0048',
      description: 'Curved claw steel hammer',
      price: 8.9,
      categoryId: 3,
      quantityInStock: 8,
      supplierIds: [5, 6]
    },
    {
      id: 8,
      productName: 'Saw',
      productCode: 'TBX-0022',
      description: '15-inch steel blade hand saw',
      price: 11.55,
      categoryId: 3,
      quantityInStock: 6,
      supplierIds: [7, 8]
    },
    {
      id: 10,
      productName: 'Video Game Controller',
      productCode: 'GMG-0042',
      description: 'Standard two-button video game controller',
      price: 35.95,
      categoryId: 5,
      quantityInStock: 12,
      supplierIds: [9, 10]
    },
    {
      id: 13,
      productName: 'Chatty Cathy (no suppliers)',
      productCode: 'GMG-0001',
      description: 'Doll from the 1960s',
      price: 675.00,
      categoryId: 5,
      quantityInStock: 0
    }
  ];
}
