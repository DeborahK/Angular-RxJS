import { InMemoryDbService } from 'angular-in-memory-web-api';

import { ProductData } from './products/product-data';
import { ProductCategoryData } from './product-categories/product-category-data';
import { SupplierData } from './suppliers/supplier-data';
import { Product } from './products/product';
import { ProductDataFromAPI } from './products/product-data-fromAPI';
import { ProductCategory } from './product-categories/product-category';
import { Supplier } from './suppliers/supplier';

export class AppData implements InMemoryDbService {

  createDb(): { products: Product[], productsFromAPI: ProductDataFromAPI, productCategories: ProductCategory[], suppliers: Supplier[]} {
    const products = ProductData.products;
    const productsFromAPI = ProductDataFromAPI.productsFromAPI;
    const productCategories = ProductCategoryData.categories;
    const suppliers = SupplierData.suppliers;
    return { products, productsFromAPI, productCategories, suppliers };
  }
}
