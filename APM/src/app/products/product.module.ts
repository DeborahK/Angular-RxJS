import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { ProductListComponent } from './product-list.component';
import { ProductListAsyncPipeComponent } from './product-list-asyncPipe.component';
import { ProductDetailComponent } from './product-detail.component';
import { ProductEditComponent } from './product-edit/product-edit.component';

import { ProductResolver } from './product-resolver.service';
import { ProductEditGuard } from './product-edit/product-edit.guard';

import { SharedModule } from '../shared/shared.module';

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
        path: 'AsyncPipe',
        component: ProductListAsyncPipeComponent
      },
      {
        path: ':id',
        component: ProductDetailComponent
      },
      {
        path: ':id/edit',
        component: ProductEditComponent,
        canDeactivate: [ProductEditGuard],
        resolve: { resolvedData: ProductResolver }
      }
    ])
  ],
  declarations: [
    ProductListComponent,
    ProductListAsyncPipeComponent,
    ProductDetailComponent,
    ProductEditComponent
  ]
})
export class ProductModule { }
