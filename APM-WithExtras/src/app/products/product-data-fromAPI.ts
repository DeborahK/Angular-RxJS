// Demonstrates how to map from one shape obtained from an external API
// to an entirely different shape.
export class ProductDataFromAPI {

  static productsFromAPI: ProductFromAPI[] = [
    {
      p_id: 1,
      p_nam: 'Leaf Rake',
      p_cd: 'GDN-0011',
      p_des: 'Leaf rake with 48-inch wooden handle',
      p_s: 'I',
      p_p: 19.95,
      p_c_fk_id: 1
    },
    {
      p_id: 2,
      p_nam: 'Garden Cart',
      p_cd: 'GDN-0023',
      p_des: '15 gallon capacity rolling garden cart',
      p_s: 'I',
      p_p: 32.99,
      p_c_fk_id: 1
    },
    {
      p_id: 5,
      p_nam: 'Hammer',
      p_cd: 'TBX-0048',
      p_des: 'Curved claw steel hammer',
      p_s: 'O',
      p_p: 8.9,
      p_c_fk_id: 3
    },
    {
      p_id: 8,
      p_nam: 'Saw',
      p_cd: 'TBX-0022',
      p_des: '15-inch steel blade hand saw',
      p_s: 'I',
      p_p: 11.55,
      p_c_fk_id: 3
    },
    {
      p_id: 10,
      p_nam: 'Video Game Controller',
      p_cd: 'GMG-0042',
      p_des: 'Standard two-button video game controller',
      p_s: 'I',
      p_p: 35.95,
      p_c_fk_id: 5
    }
  ];
}

/* Defines the product data as retrieved from the backend server API */
export interface ProductFromAPI {
p_id: number;
p_nam: string;
p_cd: string;
p_des: string;
p_s: string;
p_p: number;
p_c_fk_id: number;
}
