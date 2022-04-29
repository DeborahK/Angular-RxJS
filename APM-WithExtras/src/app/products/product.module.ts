import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { ProductListComponent } from './product-list.component';
import { ProductShellComponent } from './product-list-alt/product-shell.component';
import { ProductDetailComponent } from './product-list-alt/product-detail.component';
import { ProductListAltComponent } from './product-list-alt/product-list-alt.component';
import { ProductListRefreshComponent } from './product-list-refresh/product-list-refresh.component';

import { SharedModule } from '../shared/shared.module';
import { ProductListEditComponent } from './product-list-edit/product-list-edit.component';
import { ProductListExtrasComponent } from './product-list-extras/product-list-extras.component';
import { ProductListRegetComponent } from './product-list-reget/product-list-reget.component';

@NgModule({
  imports: [
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProductListComponent
      },
      {
        path: 'alternate',
        component: ProductShellComponent
      },
      {
        path: 'edit',
        component: ProductListEditComponent
      },
      {
        path: 'extras',
        component: ProductListExtrasComponent
      },
      {
        path: 'refresh',
        component: ProductListRefreshComponent
      }      ,
      {
        path: 'reget',
        component: ProductListRegetComponent
      }
    ])
  ],
  declarations: [
    ProductListComponent,
    ProductShellComponent,
    ProductListAltComponent,
    ProductDetailComponent,
    ProductListEditComponent,
    ProductListExtrasComponent,
    ProductListRefreshComponent,
    ProductListRegetComponent
  ]
})
export class ProductModule { }
