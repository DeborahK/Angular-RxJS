import { InMemoryDbService } from 'angular-in-memory-web-api';

import { ProductData } from './products/product-data';
import { ProductCategoryData } from './product-categories/product-category-data';
import { SupplierData } from './suppliers/supplier-data';
import { Product } from './products/product';
import { ProductCategory } from './product-categories/product-category';
import { Supplier } from './suppliers/supplier';
import { ProductDataFromAPI } from './products/product-data-fromAPI';

export class AppData implements InMemoryDbService {

  createDb(): { products: Product[], productCategories: ProductCategory[], suppliers: Supplier[], productsFromAPI: ProductDataFromAPI } {
    const products = ProductData.products;
    const productCategories = ProductCategoryData.categories;
    const suppliers = SupplierData.suppliers;
    const productsFromAPI = ProductDataFromAPI.productsFromAPI;
    return { products, productCategories, suppliers, productsFromAPI };
  }
}
